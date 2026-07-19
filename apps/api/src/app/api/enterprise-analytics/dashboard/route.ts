import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { dateRangeFromSearchParams } from '../../../../lib/enterprise-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function countRows(supabase: Awaited<ReturnType<typeof requireAdminContext>>['serviceSupabase'], table: string, from: string, to: string, filters: Record<string, string | null> = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true }).gte(table === 'enterprise_analytics_events' ? 'occurred_at' : 'created_at', from).lte(table === 'enterprise_analytics_events' ? 'occurred_at' : 'created_at', to);
  for (const [key, value] of Object.entries(filters)) {
    if (value) query = query.eq(key, value);
  }
  const { count } = await query;
  return count ?? 0;
}

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const { from, to, days } = dateRangeFromSearchParams(searchParams);
    const application = searchParams.get('application');

    const [events, staffActions, auditEvents, errors, apiRequests, securityEvents, aiEvents, notificationEvents] = await Promise.all([
      countRows(supabase, 'enterprise_analytics_events', from, to, { application }),
      countRows(supabase, 'enterprise_staff_activity_logs', from, to, { application }),
      countRows(supabase, 'enterprise_audit_logs', from, to, { application }),
      countRows(supabase, 'enterprise_analytics_events', from, to, { application, event_category: 'error' }),
      countRows(supabase, 'enterprise_analytics_events', from, to, { application, event_category: 'api' }),
      countRows(supabase, 'enterprise_analytics_events', from, to, { application, event_category: 'security' }),
      countRows(supabase, 'enterprise_analytics_events', from, to, { application, event_category: 'ai' }),
      countRows(supabase, 'enterprise_analytics_events', from, to, { application, event_category: 'notification' }),
    ]);

    const { data: recentEvents } = await supabase
      .from('enterprise_analytics_events')
      .select('id, event_name, event_category, application, module, action, success, occurred_at')
      .gte('occurred_at', from)
      .lte('occurred_at', to)
      .order('occurred_at', { ascending: false })
      .limit(30);

    const { data: kpis } = await supabase
      .from('enterprise_kpi_snapshots')
      .select('kpi_key, kpi_name, category, dashboard_role, value_numeric, target_numeric, currency, period_start, period_end')
      .gte('period_start', from)
      .lte('period_end', to)
      .order('period_end', { ascending: false })
      .limit(100);

    return NextResponse.json({
      success: true,
      range: { from, to, days },
      metrics: { events, staffActions, auditEvents, errors, apiRequests, securityEvents, aiEvents, notificationEvents },
      realtime: {
        liveUsers: 0,
        liveOrders: 0,
        liveRevenue: 0,
        liveChats: 0,
        liveTickets: 0,
        liveApiRequests: apiRequests,
        liveNotifications: notificationEvents,
        liveErrors: errors,
        liveServerHealth: errors === 0 ? 'healthy' : 'degraded',
      },
      kpis: kpis ?? [],
      recentEvents: recentEvents ?? [],
    });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to load enterprise analytics dashboard' }, { status: 500 });
  }
}