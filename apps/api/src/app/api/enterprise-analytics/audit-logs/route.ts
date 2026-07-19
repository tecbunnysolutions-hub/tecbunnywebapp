import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { dateRangeFromSearchParams, insertEnterpriseEvent } from '../../../../lib/enterprise-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const { from, to } = dateRangeFromSearchParams(searchParams);
    let query = supabase.from('enterprise_audit_logs').select('*').gte('created_at', from).lte('created_at', to).order('created_at', { ascending: false }).limit(200);
    for (const key of ['application', 'module', 'action', 'entity_type', 'entity_id', 'user_id', 'role', 'company_id', 'branch_id']) {
      const value = searchParams.get(key);
      if (value) query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, logs: data ?? [] });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminContext();
    const body = await request.json().catch(() => ({}));
    const { data, error } = await insertEnterpriseEvent(request, { ...(body as Record<string, unknown>), logType: 'audit' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}