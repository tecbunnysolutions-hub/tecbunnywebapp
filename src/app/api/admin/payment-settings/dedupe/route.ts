import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

// Simple admin guard via header token (set in Vercel env)
function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_MAINT_TOKEN;
  if (!token || !expected || expected.length < 32) {
    return false;
  }

  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return tokenBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data: rows, error } = await supabase
      .from('settings')
      .select('id, key, updated_at, created_at')
      .eq('key', 'payment_phonepe')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('payment_settings_dedupe.fetch_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to load payment settings' }, { status: 500 });
    }

    if (!rows || rows.length <= 1) {
      return NextResponse.json({ ok: true, removed: 0, keptId: rows?.[0]?.id ?? null });
    }

    // Keep the first (latest), delete the rest
    const keepId = rows[0].id as number;
    const deleteIds = rows.slice(1).map((r) => r.id as number);

    const { error: delErr } = await supabase
      .from('settings')
      .delete()
      .in('id', deleteIds);

    if (delErr) {
      logger.error('payment_settings_dedupe.delete_failed', { error: delErr.message });
      return NextResponse.json({ error: 'Failed to remove duplicate payment settings' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, removed: deleteIds.length, keptId: keepId });
  } catch (e) {
    logger.error('payment_settings_dedupe.unhandled', { error: e instanceof Error ? e.message : e });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 15;
