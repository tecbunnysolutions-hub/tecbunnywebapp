import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * GET /api/superadmin/followup-tasks
 * List pending follow-up tasks for current user
 */
export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();

    // Get user ID from session email
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch pending tasks
    const { data: tasks, error } = await supabase.rpc('get_pending_followup_tasks', {
      sales_person_id: user.id,
      include_overdue: true,
    });

    if (error) {
      logger.error('followup_tasks_fetch_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      count: (tasks || []).length,
    });
  } catch (error) {
    logger.error('followup_tasks_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/superadmin/followup-tasks
 * Create a new follow-up task
 */
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, taskType, title, dueAt, priority, method } = await request.json();

    if (!leadId || !taskType || !title || !dueAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Get current user
    const { data: user } = await supabase
      .from('profiles')
      .select('id, org_id')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create task
    const { data: task, error } = await supabase
      .from('lead_followup_tasks')
      .insert({
        lead_id: leadId,
        assigned_to: user.id,
        task_type: taskType,
        title,
        due_at: dueAt,
        priority: priority || 3,
        attempt_method: method || 'whatsapp',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('followup_task_create_failed', { leadId, error: error.message });
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    logger.info('followup_task_created', { taskId: task.id, leadId });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    logger.error('followup_task_create_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
