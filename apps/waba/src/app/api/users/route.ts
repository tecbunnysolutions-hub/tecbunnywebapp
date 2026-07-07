import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { data: users, error } = await supabase
      .from('User')
      .select('id, name, email, role, managed_pincodes')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    console.error('Failed to fetch users', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
