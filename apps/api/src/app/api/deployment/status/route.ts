import { NextResponse } from 'next/server';

import { QADeploymentService } from '@tecbunny/core';
import { PERMS } from '@tecbunny/core/roles';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const permissionCheck = await requirePermission(PERMS.RELEASE_MONITORING_MANAGE);
    if ('error' in permissionCheck) {
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
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch deployment status' }, { status: 500 });
  }
}
