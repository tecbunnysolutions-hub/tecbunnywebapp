import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { getPlatformRuntimeSnapshot } from '@/lib/superadmin-dashboard-data';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('superadmin_dashboard_platform_health.audit.requested');
    const auth = await requireSuperadminApi('superadmin_dashboard_platform_health');
    if (!auth.authorized) {
      logger.warn('superadmin_dashboard_platform_health.audit.unauthorized');
      return auth.response;
    }

    const snapshot = await getPlatformRuntimeSnapshot();
    logger.info('superadmin_dashboard_platform_health.audit.success');
    return NextResponse.json({ snapshot, generatedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    logger.error('superadmin_dashboard_platform_health.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load platform health' },
      { status: 500 },
    );
  }
}