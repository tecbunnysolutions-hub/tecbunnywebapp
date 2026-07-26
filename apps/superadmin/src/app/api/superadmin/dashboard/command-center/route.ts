import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { getSuperadminCommandCenterData } from '@/lib/superadmin-dashboard-data';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('superadmin_dashboard_command_center.audit.requested');
    const auth = await requireSuperadminApi('superadmin_dashboard_command_center');
    if (!auth.authorized) {
      logger.warn('superadmin_dashboard_command_center.audit.unauthorized');
      return auth.response;
    }

    const data = await getSuperadminCommandCenterData();
    logger.info('superadmin_dashboard_command_center.audit.success');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    logger.error('superadmin_dashboard_command_center.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load command center data' },
      { status: 500 },
    );
  }
}