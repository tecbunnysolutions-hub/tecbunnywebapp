import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { z } from 'zod';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  organization_id: z.string().min(1).optional().nullable(),
  permissions: z.array(z.string().min(1)).optional().default([]),
});

const deleteRoleSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperadminApi('superadmin_roles');
    if (!auth.authorized) return auth.response;

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
    const auth = await requireSuperadminApi('superadmin_roles');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const parsed = createRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role payload' }, { status: 400 });
    }

    const { name, description, organization_id, permissions } = parsed.data;

    const role = await withAuditEvent({
      application: 'superadmin',
      module: 'roles',
      screen: '/api/roles',
      action: 'role_create',
      description: `Created role ${name}`,
      entityType: 'role',
      entityId: name,
      oldValue: null,
      newValue: { name, description, organization_id, permissions },
      reason: 'superadmin_role_create',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/roles',
      httpMethod: 'POST',
      databaseTable: 'roles',
      priority: 'critical',
    }, async () => prisma.role.create({
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
      }));

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSuperadminApi('superadmin_roles');
    if (!auth.authorized) return auth.response;

    const parsed = deleteRoleSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid role id is required' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: parsed.data.id },
      include: {
        permissions: {
          include: { permission: true }
        }
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.is_system_role) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 409 });
    }

    await withAuditEvent({
      application: 'superadmin',
      module: 'roles',
      screen: '/api/roles',
      action: 'role_delete',
      description: `Deleted role ${role.name}`,
      entityType: 'role',
      entityId: parsed.data.id,
      oldValue: role,
      newValue: null,
      reason: 'superadmin_role_delete',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/roles',
      httpMethod: 'DELETE',
      databaseTable: 'roles',
      priority: 'critical',
    }, async () => prisma.role.delete({ where: { id: parsed.data.id } }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
