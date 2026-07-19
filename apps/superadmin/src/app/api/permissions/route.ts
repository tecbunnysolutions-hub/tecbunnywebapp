import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperadminApi('superadmin_permissions');
    if (!auth.authorized) return auth.response;

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    return NextResponse.json(permissions);
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
