import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { dateRangeFromSearchParams } from '../../../../lib/enterprise-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const { from, to } = dateRangeFromSearchParams(searchParams);
    const q = searchParams.get('q')?.trim();
    const application = searchParams.get('application');
    const moduleName = searchParams.get('module');
    const source = searchParams.get('source') || 'analytics';
    const table = source === 'audit' ? 'enterprise_audit_logs' : source === 'staff' ? 'enterprise_staff_activity_logs' : 'enterprise_analytics_events';
    const timeColumn = table === 'enterprise_analytics_events' ? 'occurred_at' : 'created_at';

    let query = supabase.from(table).select('*').gte(timeColumn, from).lte(timeColumn, to).order(timeColumn, { ascending: false }).limit(200);
    if (application) query = query.eq('application', application);
    if (moduleName) query = query.eq('module', moduleName);
    if (q) {
      query = query.or(table === 'enterprise_analytics_events'
        ? `event_name.ilike.%${q}%,description.ilike.%${q}%,user_email.ilike.%${q}%,entity_id.ilike.%${q}%`
        : `action.ilike.%${q}%,description.ilike.%${q}%,user_email.ilike.%${q}%,entity_id.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, source, results: data ?? [] });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to search enterprise logs' }, { status: 500 });
  }
}