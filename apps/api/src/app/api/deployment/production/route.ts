import { NextRequest, NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core/logger';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    logger.info('deployment_production.audit.requested');
    const permissionCheck = await requirePermission(PERMS.RELEASE_DEPLOY_PRODUCTION);
    if ('error' in permissionCheck) {
      logger.warn('deployment_production.audit.forbidden');
      return permissionCheck.error;
    }

    const { user } = await requireAdminContext();
    const body = await request.json().catch(() => ({}));

    const releaseId = typeof body.releaseId === 'string' && body.releaseId.trim().length > 0
      ? body.releaseId.trim()
      : '00000000-0000-4000-8000-000000000001';

    const deployment = await QADeploymentService.createDeploymentRecord({
      releaseId,
      environment: 'PRODUCTION',
      notes: typeof body.notes === 'string' ? body.notes : undefined,
      deployedById: user.id,
    });

    const autoComplete = body.autoComplete === true;
    const completion = autoComplete
      ? await QADeploymentService.completeDeployment({
        deploymentId: deployment.id,
        success: body.success !== false,
        notes: typeof body.completionNotes === 'string' ? body.completionNotes : undefined,
      })
      : null;

    logger.info('deployment_production.audit.success', { releaseId, autoComplete });
    return NextResponse.json({
      success: true,
      data: { deployment, completion },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      logger.warn('deployment_production.audit.auth_error', { status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('deployment_production.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to deploy to production' }, { status: 500 });
  }
}
