import { NextRequest, NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core/logger';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    logger.info('testing_coverage.audit.requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_TEST_SUITE_RUN);
    if ('error' in permissionCheck) {
      return permissionCheck.error;
    }

    const { serviceSupabase: supabase } = await requireAdminContext();

    const { searchParams } = new URL(request.url);
    const minCoverage = Number(searchParams.get('minCoverage') ?? '80');

    const { data: coverageRows, error } = await supabase
      .from('test_coverage_metrics')
      .select('id, release_id, module_name, line_coverage_percent, branch_coverage_percent, function_coverage_percent, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch coverage metrics', details: error.message }, { status: 500 });
    }

    const coverage = (coverageRows ?? []).map((row) => ({
      ...row,
      line_coverage_percent: Number(row.line_coverage_percent),
      branch_coverage_percent: Number(row.branch_coverage_percent),
      function_coverage_percent: Number(row.function_coverage_percent),
    }));

    const qualityGate = QADeploymentService.evaluateQualityGate({
      coverage,
      failedTests: 0,
      blockedTests: 0,
      minCoveragePercent: Number.isFinite(minCoverage) ? minCoverage : 80,
    });

    logger.info('testing_coverage.audit.success', { modules: coverage.length, minCoverage });
    return NextResponse.json({
      success: true,
      data: {
        minCoverage,
        modules: coverage,
        qualityGate,
      },
    });
  } catch (error) {
    logger.error('testing_coverage.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch test coverage' }, { status: 500 });
  }
}
