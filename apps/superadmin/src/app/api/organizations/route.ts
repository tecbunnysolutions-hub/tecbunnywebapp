import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { requireSuperadminApi } from '@/lib/superadmin-api';
import { z } from 'zod';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { logger } from '@tecbunny/core/logger';

export const dynamic = 'force-dynamic';

const organizationCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

const organizationDeleteSchema = z.object({
  id: z.string().uuid(),
});

function tallyByOrg(rows: { org_id: string | null }[] | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    if (!row.org_id) continue;
    counts[row.org_id] = (counts[row.org_id] ?? 0) + 1;
  }
  return counts;
}

export async function GET(_req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_organizations.audit.list_requested', { userId: auth.user?.id ?? null });
  try {
    const supabase = createSupabaseServiceClient();

    const { data: orgs, error } = await supabase
      .from('org_organizations')
      .select('id,name,created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // Aggregate related counts in bulk (avoids N+1 and matches dashboard tables).
    const [{ data: branchRows }, { data: userRows }] = await Promise.all([
      supabase.from('org_branches').select('org_id').is('deleted_at', null),
      supabase.from('sys_users').select('org_id').is('deleted_at', null),
    ]);
    const branchCounts = tallyByOrg(branchRows);
    const userCounts = tallyByOrg(userRows);

    const result = (orgs ?? []).map((org) => ({
      id: org.id,
      name: org.name,
      created_at: org.created_at,
      _count: {
        branches: branchCounts[org.id] ?? 0,
        users: userCounts[org.id] ?? 0,
      },
    }));

    logger.info('superadmin_organizations.audit.list_success', { count: result.length });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error: any) {
    logger.error('superadmin_organizations.audit.list_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_organizations.audit.create_requested', { userId: auth.user?.id ?? null });
  try {
    const parsed = organizationCreateSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid organization name is required' }, { status: 400 });
    const { name } = parsed.data;
    const supabase = createSupabaseServiceClient();
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
      databaseTable: 'org_organizations',
      priority: 'critical',
    }, async () => {
      const { data, error } = await supabase
        .from('org_organizations')
        .insert({ name })
        .select('id,name,created_at')
        .single();
      if (error) throw new Error(error.message);
      return data;
    });
    logger.info('superadmin_organizations.audit.create_success', { id: org.id });
    return NextResponse.json(org);
  } catch (error: any) {
    logger.error('superadmin_organizations.audit.create_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_organizations');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_organizations.audit.delete_requested', { userId: auth.user?.id ?? null });
  try {
    const parsed = organizationDeleteSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'A valid organization id is required' }, { status: 400 });
    const { id } = parsed.data;
    const supabase = createSupabaseServiceClient();

    const { data: organization, error: findError } = await supabase
      .from('org_organizations')
      .select('id,name,created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
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
      databaseTable: 'org_organizations',
      priority: 'critical',
    }, async () => {
      const { error } = await supabase.from('org_organizations').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return organization;
    });
    logger.info('superadmin_organizations.audit.delete_success', { id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('superadmin_organizations.audit.delete_failed', { error: error?.message ?? String(error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
