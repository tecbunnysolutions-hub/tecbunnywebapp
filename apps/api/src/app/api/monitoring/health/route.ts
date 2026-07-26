import { NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core/logger';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('monitoring_health.audit.requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_MONITORING_MANAGE);
    if ('error' in permissionCheck) {
      logger.warn('monitoring_health.audit.forbidden');
      return permissionCheck.error;
    }

    await requireAdminContext();
    const snapshot = await QADeploymentService.getReleaseDashboardSnapshot();

    logger.info('monitoring_health.audit.success');
    return NextResponse.json({
      success: true,
      data: {
        health: snapshot.productionStatus,
        uptimeStatus: snapshot.productionStatus.error_rate_percent < 1 ? 'healthy' : 'degraded',
      },
      generatedAt: snapshot.generatedAt,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('monitoring_health.audit.auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('monitoring_health.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch monitoring health' }, { status: 500 });
  }
}
