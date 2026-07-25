import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { resolveActorScope } from '@/lib/authorization-scope';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!['superadmin', 'admin', 'manager', 'sales_manager', 'marketing_manager', 'service_manager'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scope = await resolveActorScope(auth.session.user.id, auth.role);
    if (!scope) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('User')
      .select('id, name, email, role, managed_pincodes')
      .order('name', { ascending: true });

    if (!scope.isGlobal) {
      if (!scope.organizationId) {
        return NextResponse.json({ users: [] });
      }
      query = query.eq('organization_id', scope.organizationId);
      if (scope.branchId) {
        query = query.eq('branch_id', scope.branchId);
      }
    }

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: unknown) {
    console.error('Failed to fetch users', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch users' }, { status: 500 });
  }
}
