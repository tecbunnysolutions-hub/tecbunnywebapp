import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { createSupabaseClient as createPublicSupabaseClient } from '@/lib/supabase-server';
import { verifySuperadminSessionToken } from '@/lib/auth/superadmin-session';
import { logger } from '@/lib/logger';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

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

    const supabase = isSupabaseServiceConfigured
      ? createServiceClient()
      : createPublicSupabaseClient();

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (target_amount !== undefined) updateData.target_amount = Number(target_amount);
    if (amount_raised !== undefined) updateData.amount_raised = Number(amount_raised);
    if (motive !== undefined) updateData.motive = motive;
    if (detailed_information !== undefined) updateData.detailed_information = String(detailed_information);
    if (status !== undefined) updateData.status = status;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('upcoming_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('upcoming_project_update_failed', { error: error.message, id });
      return NextResponse.json({ error: 'Failed to update project: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    logger.error('upcoming_project_update_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const superadminCookie = cookieStore.get('superadmin-session')?.value;
    const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

    if (!isSuperadmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = isSupabaseServiceConfigured
      ? createServiceClient()
      : createPublicSupabaseClient();

    const { error } = await supabase
      .from('upcoming_projects')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('upcoming_project_delete_failed', { error: error.message, id });
      return NextResponse.json({ error: 'Failed to delete project: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('upcoming_project_delete_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
