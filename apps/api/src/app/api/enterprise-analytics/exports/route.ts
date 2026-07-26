import { NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { logger } from '@tecbunny/core/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    logger.info('enterprise_analytics_exports.audit.requested');
    const { serviceSupabase: supabase } = await requireAdminContext();
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const format = typeof body.format === 'string' ? body.format : 'csv';
    const { data, error } = await supabase.from('enterprise_report_exports').insert({
      requested_by: typeof body.requestedBy === 'string' ? body.requestedBy : null,
      report_type: typeof body.reportType === 'string' ? body.reportType : 'enterprise_analytics',
      format,
      filters: body.filters && typeof body.filters === 'object' ? body.filters : {},
      status: format === 'print' ? 'completed' : 'queued',
      completed_at: format === 'print' ? new Date().toISOString() : null,
    }).select('id, status').single();
    if (error) {
      logger.error('enterprise_analytics_exports.audit.insert_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    logger.info('enterprise_analytics_exports.audit.success', { exportId: data?.id ?? null, format });
    return NextResponse.json({ success: true, export: data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('enterprise_analytics_exports.audit.auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('enterprise_analytics_exports.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to queue export' }, { status: 500 });
  }
}