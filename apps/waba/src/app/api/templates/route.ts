import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const templateSchema = z.object({
  name: z.string().trim().regex(/^[a-z0-9_]{3,80}$/),
  content: z.string().trim().min(1).max(1024),
  language: z.string().trim().min(2).max(10).default('en'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']).default('MARKETING'),
});

function countVariables(content: string) {
  const matches = content.match(/\{\{\d+\}\}/g) ?? [];
  return new Set(matches).size;
}

export async function GET() {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: templates, error } = await supabase.from('Template').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Seed templates if empty for demo purposes
    if (!templates || templates.length === 0) {
      const demoTemplates = [
        { id: crypto.randomUUID(), name: 'welcome_message', content: 'Hello {{1}}, welcome to our service! How can we help you today?', status: 'DRAFT', provider_status: 'LOCAL_ONLY', variable_count: 1 },
        { id: crypto.randomUUID(), name: 'appointment_reminder', content: 'Hi {{1}}, this is a reminder for your appointment tomorrow at {{2}}.', status: 'DRAFT', provider_status: 'LOCAL_ONLY', variable_count: 2 },
        { id: crypto.randomUUID(), name: 'out_of_office', content: 'Thank you for your message. We are currently out of the office. We will reply when we return.', status: 'DRAFT', provider_status: 'LOCAL_ONLY', variable_count: 0 }
      ];
      await supabase.from('Template').insert(demoTemplates);
      return NextResponse.json({ templates: demoTemplates });
    }

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const parsed = templateSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid template payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, content, language, category } = parsed.data;
    const id = crypto.randomUUID();
    const templatePayload = {
      id,
      name,
      content,
      language,
      category,
      status: 'PENDING',
      provider_name: 'infobip',
      provider_status: 'LOCAL_ONLY',
      variable_count: countVariables(content),
    };
    const { data, error } = await withAuditEvent({
      application: 'waba',
      module: 'templates',
      screen: '/api/templates',
      action: 'whatsapp_template_create',
      description: `Created WhatsApp template ${name}`,
      entityType: 'whatsapp_template',
      entityId: id,
      oldValue: null,
      newValue: templatePayload,
      reason: 'waba_template_create',
      context: { userId: auth.session?.user?.id, userEmail: auth.session?.user?.email, role: auth.role },
      apiEndpoint: '/api/templates',
      httpMethod: 'POST',
      databaseTable: 'Template',
      priority: 'high',
    }, async () => supabase.from('Template').insert(templatePayload).select().single());
    if (error) throw error;
    return NextResponse.json({ success: true, template: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
