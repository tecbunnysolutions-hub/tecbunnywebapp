import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: users, error } = await supabase
      .from('User')
      .select('id, name, email, role, managed_pincodes')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: unknown) {
    console.error('Failed to fetch users', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch users' }, { status: 500 });
  }
}
