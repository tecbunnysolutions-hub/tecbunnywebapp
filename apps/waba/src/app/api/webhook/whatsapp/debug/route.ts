import { NextResponse } from 'next/server';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { supabase } from '@/lib/supabase';

/**
 * Read the webhook debug trail (Hobby plan hides Vercel logs, so the inline
 * webhook path writes stages to webhook_debug_log). Superadmin/staff only.
 * GET /api/webhook/whatsapp/debug?limit=50
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  if (auth.role === 'customer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 50), 1), 200);

  const { data, error } = await supabase
    .from('webhook_debug_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
