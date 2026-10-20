import { NextResponse } from 'next/server';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { supabase } from '@/lib/supabase';
import { redactDebugDetail } from '@/lib/redact-debug';

/**
 * Read the webhook debug trail (Hobby plan hides Vercel logs, so the inline
 * webhook path writes stages to webhook_debug_log). Non-production and
 * superadmin only; returns 404 in production. Phone numbers and message
 * bodies are redacted.
 * GET /api/webhook/whatsapp/debug?limit=50
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const auth = await requireApiRole({ allowedRoles: ['superadmin'] });
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 50), 1), 200);

  const { data, error } = await supabase
    .from('webhook_debug_log')
    .select('id, stage, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Failed to load debug log' }, { status: 500 });
  }

  const entries = (data ?? []).map((row) => ({ ...row, detail: redactDebugDetail(row.detail) }));
  return NextResponse.json({ entries });
}
