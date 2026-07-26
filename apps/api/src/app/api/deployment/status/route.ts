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
    logger.info('deployment_status.audit.requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_MONITORING_MANAGE);
    if ('error' in permissionCheck) {
      logger.warn('deployment_status.audit.forbidden');
      return permissionCheck.error;
    }

    await requireAdminContext();
    const snapshot = await QADeploymentService.getReleaseDashboardSnapshot();

    return NextResponse.json({
      success: true,
      data: {
        latestBuild: snapshot.latestRelease,
        qaStatus: snapshot.qaStatus,
        productionStatus: snapshot.productionStatus,
      },
      generatedAt: snapshot.generatedAt,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('deployment_status.audit.auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('deployment_status.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch deployment status' }, { status: 500 });
  }
}
