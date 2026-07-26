import { NextRequest, NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core/logger';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('testing_results.audit.requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_TEST_SUITE_RUN);
    if ('error' in permissionCheck) {
      logger.warn('testing_results.audit.forbidden');
      return permissionCheck.error;
    }

    await requireAdminContext();
    const snapshot = await QADeploymentService.getReleaseDashboardSnapshot();

    logger.info('testing_results.audit.success');
    return NextResponse.json({
      success: true,
      data: {
        summary: snapshot.qaStatus,
        qualityGate: {
          failed: snapshot.qaStatus.failed,
          blocked: snapshot.qaStatus.blocked,
          pass: snapshot.qaStatus.failed === 0 && snapshot.qaStatus.blocked === 0,
        },
      },
      generatedAt: snapshot.generatedAt,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('testing_results.audit.auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('testing_results.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch testing results' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('testing_results.audit.record_requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_TEST_SUITE_RUN);
    if ('error' in permissionCheck) {
      logger.warn('testing_results.audit.record_forbidden');
      return permissionCheck.error;
    }

    await requireAdminContext();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (typeof body.testSuiteId !== 'string' || typeof body.status !== 'string') {
      return NextResponse.json({ error: 'testSuiteId and status are required' }, { status: 400 });
    }

    const result = await QADeploymentService.recordTestExecution({
      id: typeof body.id === 'string' ? body.id : '00000000-0000-4000-8000-000000000010',
      test_suite_id: body.testSuiteId,
      release_id: typeof body.releaseId === 'string' ? body.releaseId : undefined,
      status: body.status,
      passed_count: Number.isFinite(body.passedCount) ? Number(body.passedCount) : 0,
      failed_count: Number.isFinite(body.failedCount) ? Number(body.failedCount) : 0,
      blocked_count: Number.isFinite(body.blockedCount) ? Number(body.blockedCount) : 0,
      pending_count: Number.isFinite(body.pendingCount) ? Number(body.pendingCount) : 0,
      executed_at: new Date().toISOString(),
    });

    logger.info('testing_results.audit.record_success', { testSuiteId: body.testSuiteId });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('testing_results.audit.record_auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('testing_results.audit.record_failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to record testing results' }, { status: 500 });
  }
}
