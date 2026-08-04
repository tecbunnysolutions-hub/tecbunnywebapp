import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { z } from 'zod';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { logger } from '@tecbunny/core/logger';

export const dynamic = 'force-dynamic';

const branchCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organization_id: z.string().uuid(),
  location: z.string().trim().max(180).optional().nullable(),
});

const branchDeleteSchema = z.object({
  id: z.string().uuid(),
});

// The physical org_branches table stores free-form location inside the
// `address` JSONB column ({ text: '...' }); normalize both directions here so
// the UI keeps a simple `location` string contract.
function readLocation(address: unknown): string | null {
  if (!address) return null;
  if (typeof address === 'string') return address;
  if (typeof address === 'object' && address !== null) {
    const value = (address as Record<string, unknown>).text;
    return typeof value === 'string' ? value : null;
  }
  return null;
}

export async function GET(_req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_branches.audit.list_requested', { userId: auth.user?.id ?? null });
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('org_branches')
      .select('id,org_id,name,address,created_at,organization:org_organizations(name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const branches = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      location: readLocation(row.address),
      organization_id: row.org_id,
      created_at: row.created_at,
      organization: { name: row.organization?.name ?? '' },
    }));

    logger.info('superadmin_branches.audit.list_success', { count: branches.length });
    return NextResponse.json(branches, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error: any) {
    logger.error('superadmin_branches.audit.list_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_branches.audit.create_requested', { userId: auth.user?.id ?? null });
  try {
    const parsed = branchCreateSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'Name and a valid organization id are required' }, { status: 400 });
    const { name, organization_id, location } = parsed.data;
    const supabase = createSupabaseServiceClient();
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
      databaseTable: 'org_branches',
      priority: 'critical',
    }, async () => {
      const { data, error } = await supabase
        .from('org_branches')
        .insert({
          org_id: organization_id,
          name,
          address: location ? { text: location } : null,
        })
        .select('id,org_id,name,address,created_at')
        .single();
      if (error) throw new Error(error.message);
      return data;
    });
    logger.info('superadmin_branches.audit.create_success', { id: branch.id });
    return NextResponse.json({
      id: branch.id,
      name: branch.name,
      location: readLocation(branch.address),
      organization_id: branch.org_id,
      created_at: branch.created_at,
    });
  } catch (error: any) {
    logger.error('superadmin_branches.audit.create_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_branches');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_branches.audit.delete_requested', { userId: auth.user?.id ?? null });
  try {
    const parsed = branchDeleteSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid branch id is required' }, { status: 400 });
    const { id } = parsed.data;
    const supabase = createSupabaseServiceClient();

    const { data: branch, error: findError } = await supabase
      .from('org_branches')
      .select('id,org_id,name,address,created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
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
      databaseTable: 'org_branches',
      priority: 'critical',
    }, async () => {
      const { error } = await supabase.from('org_branches').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return branch;
    });
    logger.info('superadmin_branches.audit.delete_success', { id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('superadmin_branches.audit.delete_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
