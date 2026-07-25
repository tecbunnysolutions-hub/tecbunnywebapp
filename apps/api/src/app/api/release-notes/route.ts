import { NextRequest, NextResponse } from 'next/server';

import { PERMS } from '@tecbunny/core/roles';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { requirePermission } from '@tecbunny/core/server-role-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(PERMS.RELEASE_PRODUCTION_LOGS_VIEW);
    if ('error' in permissionCheck) {
      return permissionCheck.error;
    }

    const { serviceSupabase: supabase } = await requireAdminContext();
    const { searchParams } = new URL(request.url);
    const releaseId = searchParams.get('releaseId');

    let query = supabase
      .from('release_notes')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(100);

    if (releaseId) {
      query = query.eq('release_id', releaseId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch release notes', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch release notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(PERMS.RELEASE_GOLIVE_APPROVE);
    if ('error' in permissionCheck) {
      return permissionCheck.error;
    }

    const { serviceSupabase: supabase } = await requireAdminContext();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (typeof body.releaseId !== 'string' || body.releaseId.trim().length === 0) {
      return NextResponse.json({ error: 'releaseId is required' }, { status: 400 });
    }

    if (typeof body.summary !== 'string' || body.summary.trim().length === 0) {
      return NextResponse.json({ error: 'summary is required' }, { status: 400 });
    }

    const payload = {
      id: typeof body.id === 'string' ? body.id : '00000000-0000-4000-8000-000000000030',
      release_id: body.releaseId.trim(),
      summary: body.summary.trim(),
      fixed_bugs: Array.isArray(body.fixedBugs) ? body.fixedBugs : [],
      known_issues: Array.isArray(body.knownIssues) ? body.knownIssues : [],
      breaking_changes: Array.isArray(body.breakingChanges) ? body.breakingChanges : [],
      migration_notes: typeof body.migrationNotes === 'string' ? body.migrationNotes : null,
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('release_notes')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save release notes', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to save release notes' }, { status: 500 });
  }
}
