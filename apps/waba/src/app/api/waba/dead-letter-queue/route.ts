import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { OutboundEventService } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';
import type { OutboundEventRecord } from '@tecbunny/core';

/**
 * GET /api/waba/dead-letter-queue
 * 
 * Admin endpoint to view messages that have failed and exhausted retries.
 * These messages require manual intervention or replay.
 * 
 * Query parameters:
 *   - limit: Maximum number of events to return (default 50, max 200)
 */
export async function GET(req: NextRequest) {
  const correlationId = `dlq-get-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const auth = await requireApiRole({
      allowedRoles: ['admin', 'superadmin', 'marketing_manager'],
    });
    if (auth.error) return auth.error;

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    const supabase = createSupabaseServiceClient();
    const events = await OutboundEventService.getDeadLetterEvents(supabase, limit);

    const metrics = await OutboundEventService.getMetrics(supabase, 24);

    logger.info('dlq.viewed', {
      correlationId,
      count: events.length,
      viewedBy: auth.session?.user?.email,
    });

    return NextResponse.json({
      success: true,
      correlationId,
      count: events.length,
      events: events.map((e: OutboundEventRecord) => ({
        id: e.id,
        phone_number: e.phone_number,
        message_type: e.message_type,
        status: e.status,
        attempts: e.attempt_count,
        last_error: e.last_error_message,
        last_error_code: e.last_error_code,
        dead_lettered_at: e.dead_lettered_at,
        conversation_id: e.conversation_id,
        campaign_id: e.campaign_id,
        correlation_id: e.correlation_id,
      })),
      metrics,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dead-letter queue';
    logger.error('dlq.fetch_failed', { correlationId, error: message });
    return NextResponse.json(
      { error: message, correlationId },
      { status: 500 }
    );
  }
}
