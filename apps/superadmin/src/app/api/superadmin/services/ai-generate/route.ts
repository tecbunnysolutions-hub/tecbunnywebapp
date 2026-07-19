import { NextRequest, NextResponse } from 'next/server';

import { generateGeminiText } from '@tecbunny/core/ai/gemini-service';
import { logger } from '@tecbunny/core/logger';
import { isSuperadmin, isSuperadminSession } from '@tecbunny/core/permissions';
import { createSupabaseClient } from '@tecbunny/database/server';

async function checkAuth() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(await isSuperadminSession() || await isSuperadmin(user));
  } catch (error) {
    logger.warn('superadmin_service_ai.auth_failed', { error });
    return false;
  }
}

function buildPrompt(name: string, field: string) {
  if (field === 'terms_and_conditions') {
    return `Write concise, professional terms and conditions for a TecBunny service named "${name}". Use 5 short bullet points. Cover scope, scheduling, customer prerequisites, exclusions, and warranty/support boundaries. Do not include markdown headings.`;
  }

  return `Write a concise, polished service description for a TecBunny service named "${name}". Keep it under 90 words, operational and customer-facing, with no markdown heading.`;
}

export async function POST(request: NextRequest) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const field = body.field === 'terms_and_conditions' ? 'terms_and_conditions' : 'description';

    if (name.length < 3) {
      return NextResponse.json({ error: 'Service name must be at least 3 characters' }, { status: 400 });
    }

    const text = await generateGeminiText({
      prompt: buildPrompt(name, field),
      temperature: 0.35,
      maxOutputTokens: field === 'terms_and_conditions' ? 420 : 180,
    });

    return NextResponse.json({ text });
  } catch (error) {
    logger.error('superadmin_service_ai.generate_failed', { error });
    return NextResponse.json({ error: 'Failed to generate service copy' }, { status: 500 });
  }
}