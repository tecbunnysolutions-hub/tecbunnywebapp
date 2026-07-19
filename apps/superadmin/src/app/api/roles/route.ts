import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuperadminSession, isSuperadmin } from '@tecbunny/core/permissions';
import {  createSupabaseClient  } from '@tecbunny/database/server';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  organization_id: z.string().min(1).optional().nullable(),
  permissions: z.array(z.string().min(1)).optional().default([]),
});

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
    const parsed = createRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role payload' }, { status: 400 });
    }

    const { name, description, organization_id, permissions } = parsed.data;

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
