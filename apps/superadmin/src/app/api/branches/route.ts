import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { z } from 'zod';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';

const branchCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organization_id: z.string().uuid(),
  location: z.string().trim().max(180).optional().nullable(),
});

const branchDeleteSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  try {
    const branches = await prisma.branch.findMany({
      include: {
        organization: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  try {
    const parsed = branchCreateSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'Name and a valid organization id are required' }, { status: 400 });
    const { name, organization_id, location } = parsed.data;
    const branch = await withAuditEvent({
      application: 'superadmin',
      module: 'branches',
      screen: '/api/branches',
      action: 'branch_create',
      description: `Created branch ${name}`,
      entityType: 'branch',
      entityId: name,
      oldValue: null,
      newValue: { name, organization_id, location },
      reason: 'superadmin_branch_create',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/branches',
      httpMethod: 'POST',
      databaseTable: 'branches',
      priority: 'critical',
    }, async () => prisma.branch.create({
        data: { name, organization_id, location }
      }));
    return NextResponse.json(branch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  try {
    const parsed = branchDeleteSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid branch id is required' }, { status: 400 });
    const { id } = parsed.data;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    await withAuditEvent({
      application: 'superadmin',
      module: 'branches',
      screen: '/api/branches',
      action: 'branch_delete',
      description: `Deleted branch ${branch.name}`,
      entityType: 'branch',
      entityId: id,
      oldValue: branch,
      newValue: null,
      reason: 'superadmin_branch_delete',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/branches',
      httpMethod: 'DELETE',
      databaseTable: 'branches',
      priority: 'critical',
    }, async () => prisma.branch.delete({ where: { id } }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
