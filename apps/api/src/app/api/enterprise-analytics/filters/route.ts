import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { logger } from '@tecbunny/core/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    logger.info('enterprise_filters.audit.requested');
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let query = supabase.from('enterprise_saved_filters').select('*').order('updated_at', { ascending: false }).limit(100);
    if (userId) query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
    const { data, error } = await query;
    if (error) {
      logger.error('enterprise_filters.audit.query_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    logger.info('enterprise_filters.audit.success', { count: data?.length ?? 0 });
    return NextResponse.json({ success: true, filters: data ?? [] });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    logger.error('enterprise_filters.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to load saved filters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    logger.info('enterprise_filters.audit.create_requested');
    const { serviceSupabase: supabase } = await requireAdminContext();
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const { data, error } = await supabase.from('enterprise_saved_filters').insert({
      user_id: typeof body.userId === 'string' ? body.userId : 'unknown',
      name: typeof body.name === 'string' ? body.name : 'Untitled filter',
      scope: typeof body.scope === 'string' ? body.scope : 'analytics',
      filters: body.filters && typeof body.filters === 'object' ? body.filters : {},
      is_shared: typeof body.isShared === 'boolean' ? body.isShared : false,
    }).select('id').single();
    if (error) {
      logger.error('enterprise_filters.audit.create_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    logger.info('enterprise_filters.audit.create_success', { id: data?.id ?? null });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    logger.error('enterprise_filters.audit.create_exception', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to save filter' }, { status: 500 });
  }
}