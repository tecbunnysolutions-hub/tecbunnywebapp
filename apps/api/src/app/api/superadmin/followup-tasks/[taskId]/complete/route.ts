import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * POST /api/superadmin/followup-tasks/[taskId]/complete
 * Mark a follow-up task as completed
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notes } = await request.json();
    const supabase = createSupabaseServiceClient();

    // Call database function to complete task
    const { data, error } = await supabase.rpc('complete_followup_task', {
      task_id: taskId,
      notes: notes || null,
    });

    if (error) {
      logger.error('followup_task_complete_failed', {
        taskId,
        error: error.message,
      });
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    logger.info('followup_task_completed', { taskId });

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
    });
  } catch (error) {
    logger.error('followup_task_complete_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
