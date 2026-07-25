import { NextRequest, NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(PERMS.RELEASE_ROLLBACK);
    if ('error' in permissionCheck) {
      return permissionCheck.error;
    }

    const { user } = await requireAdminContext();
    const body = await request.json().catch(() => ({}));

    if (typeof body.deploymentId !== 'string' || body.deploymentId.trim().length === 0) {
      return NextResponse.json({ error: 'deploymentId is required' }, { status: 400 });
    }

    if (typeof body.reason !== 'string' || body.reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    if (typeof body.rolledBackToVersion !== 'string' || body.rolledBackToVersion.trim().length === 0) {
      return NextResponse.json({ error: 'rolledBackToVersion is required' }, { status: 400 });
    }

    const rollback = await QADeploymentService.rollbackDeployment({
      deploymentId: body.deploymentId.trim(),
      reason: body.reason.trim(),
      rolledBackToVersion: body.rolledBackToVersion.trim(),
      initiatedById: user.id,
    });

    return NextResponse.json({
      success: true,
      data: rollback,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to rollback deployment' }, { status: 500 });
  }
}
