import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';
import { isSuperadmin, isSuperadminSession } from '@tecbunny/core/permissions';
import { createServiceClient } from '@tecbunny/database/admin';
import { createSupabaseClient } from '@tecbunny/database/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function checkAuth() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(await isSuperadminSession() || await isSuperadmin(user));
  } catch (error) {
    logger.warn('superadmin_inquiry_assignment.auth_failed', { error });
    return false;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const assignedUserId = typeof body.assignedUserId === 'string' ? body.assignedUserId : '';
    if (!id || !assignedUserId) return NextResponse.json({ error: 'Inquiry id and assigned user are required' }, { status: 400 });

    const supabase = createServiceClient();
    const { data: assignee } = await supabase
      .from('profiles')
      .select('id,name,full_name,email,mobile')
      .eq('id', assignedUserId)
      .maybeSingle();

    const handledByName = assignee?.full_name || assignee?.name || assignee?.email || assignee?.mobile || assignedUserId;
    const { data, error } = await supabase
      .from('contact_messages')
      .update({
        assigned_user_id: assignedUserId,
        handled_by: assignedUserId,
        handled_by_name: handledByName,
        status: 'Assigned',
        assigned_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ inquiry: data });
  } catch (error) {
    logger.error('superadmin_inquiry_assignment.update_failed', { error });
    return NextResponse.json({ error: 'Failed to assign inquiry' }, { status: 500 });
  }
}