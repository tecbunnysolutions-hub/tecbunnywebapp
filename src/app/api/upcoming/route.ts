import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { createSupabaseClient as createPublicSupabaseClient } from '@/lib/supabase-server';
import { verifySuperadminSessionToken } from '@/lib/auth/superadmin-session';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = isSupabaseServiceConfigured
      ? createServiceClient()
      : createPublicSupabaseClient();

    const { data, error } = await supabase
      .from('upcoming_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('upcoming_projects_fetch_failed', { error: error.message });
      // If table doesn't exist yet, return an empty array to prevent dashboard crashes
      if (error.code === '42P01') {
        return NextResponse.json({ projects: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: data ?? [] });
  } catch (error) {
    logger.error('upcoming_projects_fetch_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const superadminCookie = cookieStore.get('superadmin-session')?.value;
    const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

    if (!isSuperadmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      explanation,
      target_amount,
      amount_raised,
      motive,
      detailed_information,
      status,
    } = body;

    if (!name || !explanation || target_amount === undefined || !motive || !detailed_information) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = isSupabaseServiceConfigured
      ? createServiceClient()
      : createPublicSupabaseClient();

    const insertData = {
      name,
      explanation,
      target_amount: Number(target_amount),
      amount_raised: amount_raised !== undefined ? Number(amount_raised) : 0,
      motive,
      detailed_information: String(detailed_information),
      status: status || 'Pipeline',
    };

    const { data, error } = await supabase
      .from('upcoming_projects')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      logger.error('upcoming_project_insert_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to create project: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    logger.error('upcoming_project_insert_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
