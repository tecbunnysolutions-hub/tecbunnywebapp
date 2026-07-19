import { NextResponse } from 'next/server';

import { getSuperadminCommandCenterData } from '@/lib/superadmin-dashboard-data';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperadminApi('superadmin_dashboard_command_center');
  if (!auth.authorized) return auth.response;

  try {
    const data = await getSuperadminCommandCenterData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load command center data' },
      { status: 500 },
    );
  }
}