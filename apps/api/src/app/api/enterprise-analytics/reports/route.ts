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
    const reportType = searchParams.get('reportType') || 'executive';

    const [{ count: analyticsCount }, { count: staffCount }, { count: auditCount }, { data: kpis }] = await Promise.all([
      supabase.from('enterprise_analytics_events').select('*', { count: 'exact', head: true }).gte('occurred_at', from).lte('occurred_at', to),
      supabase.from('enterprise_staff_activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', from).lte('created_at', to),
      supabase.from('enterprise_audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', from).lte('created_at', to),
      supabase.from('enterprise_kpi_snapshots').select('*').gte('period_start', from).lte('period_end', to).limit(200),
    ]);

    return NextResponse.json({
      success: true,
      reportType,
      range: { from, to },
      supportedFormats: ['csv', 'excel', 'pdf', 'print'],
      summary: { analyticsEvents: analyticsCount ?? 0, staffActions: staffCount ?? 0, auditEvents: auditCount ?? 0 },
      kpis: kpis ?? [],
    });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}