import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { OutboundEventService } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';

/**
 * POST /api/waba/dead-letter-queue/[id]/replay
 * 
 * Admin action to replay a dead-lettered message.
 * Resets attempt count and marks message as PENDING for retry.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = `dlq-replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const auth = await requireApiRole({
      allowedRoles: ['admin', 'superadmin'],
    });
    if (auth.error) return auth.error;

    const { id: eventId } = await context.params;

    if (!eventId) {
      logger.warn('dlq.replay.missing_id', { correlationId });
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const event = await OutboundEventService.replayDeadLetteredEvent(
      supabase,
      eventId,
      auth.session?.user?.id || 'unknown'
    );

    logger.info('dlq.replay.success', {
      correlationId,
      eventId,
      phone: event.phone_number,
      replayedBy: auth.session?.user?.email,
    });

    return NextResponse.json({
      success: true,
      correlationId,
      eventId,
      message: 'Event replayed and marked for retry',
      event: {
        id: event.id,
        status: event.status,
        phone_number: event.phone_number,
        next_retry_at: event.next_retry_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to replay event';
    logger.error('dlq.replay.failed', { correlationId, error: message });
    return NextResponse.json(
      { error: message, correlationId },
      { status: 500 }
    );
  }
}
