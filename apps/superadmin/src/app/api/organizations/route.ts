import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { z } from 'zod';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';

const organizationCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

const organizationDeleteSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { branches: true, users: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  try {
    const parsed = organizationCreateSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid organization name is required' }, { status: 400 });
    const { name } = parsed.data;
    const org = await withAuditEvent({
      application: 'superadmin',
      module: 'organizations',
      screen: '/api/organizations',
      action: 'organization_create',
      description: `Created organization ${name}`,
      entityType: 'organization',
      entityId: name,
      oldValue: null,
      newValue: { name },
      reason: 'superadmin_organization_create',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/organizations',
      httpMethod: 'POST',
      databaseTable: 'organizations',
      priority: 'critical',
    }, async () => prisma.organization.create({ data: { name } }));
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  try {
    const parsed = organizationDeleteSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid organization id is required' }, { status: 400 });
    const { id } = parsed.data;
    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    await withAuditEvent({
      application: 'superadmin',
      module: 'organizations',
      screen: '/api/organizations',
      action: 'organization_delete',
      description: `Deleted organization ${organization.name}`,
      entityType: 'organization',
      entityId: id,
      oldValue: organization,
      newValue: null,
      reason: 'superadmin_organization_delete',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/organizations',
      httpMethod: 'DELETE',
      databaseTable: 'organizations',
      priority: 'critical',
    }, async () => prisma.organization.delete({ where: { id } }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
