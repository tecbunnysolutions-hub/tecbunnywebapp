import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { logger } from '@tecbunny/core/logger';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperadminApi('superadmin_permissions');
    if (!auth.authorized) return auth.response;
    logger.info('superadmin_permissions.audit.list_requested', { userId: auth.user?.id ?? null });

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    logger.info('superadmin_permissions.audit.list_success', { count: permissions.length });
    return NextResponse.json(permissions);
  } catch (error: any) {
    logger.error('superadmin_permissions.audit.list_failed', { error: error?.message ?? String(error) });
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
