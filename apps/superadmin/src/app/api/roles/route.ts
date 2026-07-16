import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isSuperadminSession, isSuperadmin } from '@tecbunny/core/permissions';
import { createSupabaseClient } from '@tecbunny/database';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!await isSuperadminSession() && !await isSuperadmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const orgId = url.searchParams.get('organization_id');

    const roles = await prisma.role.findMany({
      where: orgId ? { organization_id: orgId } : {},
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!await isSuperadminSession() && !await isSuperadmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, organization_id, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        organization_id,
        permissions: {
          create: (permissions || []).map((permId: string) => ({
            permission_id: permId
          }))
        }
      },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
