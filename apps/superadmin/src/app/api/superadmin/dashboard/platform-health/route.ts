import { NextResponse } from 'next/server';

import { getPlatformRuntimeSnapshot } from '@/lib/superadmin-dashboard-data';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperadminApi('superadmin_dashboard_platform_health');
  if (!auth.authorized) return auth.response;

  try {
    const snapshot = await getPlatformRuntimeSnapshot();
    return NextResponse.json({ snapshot, generatedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load platform health' },
      { status: 500 },
    );
  }
}