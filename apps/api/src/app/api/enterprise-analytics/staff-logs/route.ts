import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { logger } from '@tecbunny/core/logger';
import { dateRangeFromSearchParams, insertEnterpriseEvent } from '../../../../lib/enterprise-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    logger.info('enterprise_staff_logs.audit.requested');
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const { from, to } = dateRangeFromSearchParams(searchParams);
    let query = supabase.from('enterprise_staff_activity_logs').select('*').gte('created_at', from).lte('created_at', to).order('created_at', { ascending: false }).limit(200);
    for (const key of ['application', 'module', 'action', 'user_id', 'role', 'company_id', 'branch_id', 'department']) {
      const value = searchParams.get(key);
      if (value) query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) {
      logger.error('enterprise_staff_logs.audit.query_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    logger.info('enterprise_staff_logs.audit.success', { count: data?.length ?? 0 });
    return NextResponse.json({ success: true, logs: data ?? [] });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    logger.error('enterprise_staff_logs.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to load staff activity logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    logger.info('enterprise_staff_logs.audit.create_requested');
    await requireAdminContext();
    const body = await request.json().catch(() => ({}));
    const { data, error } = await insertEnterpriseEvent(request, { ...(body as Record<string, unknown>), logType: 'staff_activity' });
    if (error) {
      logger.error('enterprise_staff_logs.audit.create_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    logger.info('enterprise_staff_logs.audit.create_success', { id: data?.id ?? null });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    logger.error('enterprise_staff_logs.audit.create_exception', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to record staff activity' }, { status: 500 });
  }
}