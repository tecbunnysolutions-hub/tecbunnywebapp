import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';
import { logger } from '@tecbunny/core';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * POST /api/superadmin/followup-tasks/[taskId]/snooze
 * Snooze a follow-up task
 */
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const token = request.headers.get('cookie')?.split('superadmin-session=')[1]?.split(';')[0];
    const session = await verifySuperadminSessionToken(token, request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { snoozeHours = 24 } = await request.json();
    const supabase = createSupabaseServiceClient();

    // Call database function to snooze task
    const { data, error } = await supabase.rpc('snooze_followup_task', {
      task_id: params.taskId,
      snooze_hours: snoozeHours,
    });

    if (error) {
      logger.error('followup_task_snooze_failed', {
        taskId: params.taskId,
        error: error.message,
      });
      return NextResponse.json({ error: 'Failed to snooze task' }, { status: 500 });
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Task snoozed for ${snoozeHours} hours`,
        newDueAt: data[0].new_due_at,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Task snoozed for ${snoozeHours} hours`,
    });
  } catch (error) {
    logger.error('followup_task_snooze_error', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
