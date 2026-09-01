import { createClient } from '@tecbunny/database';
import { logger } from '../logger';

type SupabaseClient = ReturnType<typeof createClient>;

export interface OutboundMessagePayload {
  phone_number: string;
  message_type: 'template' | 'text' | 'media' | 'interactive';
  message_content: Record<string, unknown>;
  
  // Optional references
  conversation_id?: string;
  lead_id?: string;
  campaign_id?: string;
  user_id?: string;
  correlation_id?: string;
  max_retries?: number;
}

export interface OutboundEventRecord {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED' | 'DEAD_LETTER';
  attempt_count: number;
  max_retries: number;
  last_error_code: string | null;
  last_error_message: string | null;
  next_retry_at: string | null;
  provider_message_id: string | null;
  phone_number: string;
}

export class OutboundEventService {
  /**
   * Create a new outbound message event to be sent.
   * This registers the message in the retry system BEFORE attempting to send.
   */
  static async createEvent(
    supabase: SupabaseClient,
    payload: OutboundMessagePayload
  ): Promise<OutboundEventRecord> {
    const correlationId = payload.correlation_id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('waba_outbound_events')
      .insert({
        phone_number: payload.phone_number,
        message_type: payload.message_type,
        message_content: payload.message_content,
        conversation_id: payload.conversation_id || null,
        lead_id: payload.lead_id || null,
        campaign_id: payload.campaign_id || null,
        user_id: payload.user_id || null,
        correlation_id: correlationId,
        status: 'PENDING',
        attempt_count: 0,
        max_retries: payload.max_retries || 3,
      })
      .select('*')
      .single();

    if (error) {
      logger.error('outbound_event.create_failed', {
        error: error.message,
        phone: payload.phone_number,
      });
      throw error;
    }

    logger.info('outbound_event.created', {
      eventId: data.id,
      phone: payload.phone_number,
      correlationId,
    });

    return data;
  }

  /**
   * Mark an event as being processed (send attempt in progress).
   */
  static async markProcessing(
    supabase: SupabaseClient,
    eventId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('waba_outbound_events')
      .update({
        status: 'PROCESSING',
        first_attempt_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      logger.error('outbound_event.mark_processing_failed', {
        error: error.message,
        eventId,
      });
      throw error;
    }
  }

  /**
   * Mark an event as delivered (successful send).
   */
  static async markDelivered(
    supabase: SupabaseClient,
    eventId: string,
    providerMessageId: string,
    providerStatus: string
  ): Promise<void> {
    const { error } = await supabase
      .from('waba_outbound_events')
      .update({
        status: 'DELIVERED',
        completed_at: new Date().toISOString(),
        provider_message_id: providerMessageId,
        provider_status: providerStatus,
      })
      .eq('id', eventId);

    if (error) {
      logger.error('outbound_event.mark_delivered_failed', {
        error: error.message,
        eventId,
      });
      throw error;
    }

    logger.info('outbound_event.delivered', {
      eventId,
      providerMessageId,
    });
  }

  /**
   * Mark an event as failed and schedule a retry.
   * Returns true if retrying, false if max retries exhausted.
   */
  static async markFailedAndScheduleRetry(
    supabase: SupabaseClient,
    eventId: string,
    errorCode: string,
    errorMessage: string
  ): Promise<{ shouldRetry: boolean; nextRetryAt: string | null }> {
    // Fetch current event to check retry count
    const { data: event, error: fetchError } = await supabase
      .from('waba_outbound_events')
      .select('attempt_count, max_retries, error_history')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      logger.error('outbound_event.fetch_for_retry_failed', {
        error: fetchError?.message,
        eventId,
      });
      return { shouldRetry: false, nextRetryAt: null };
    }

    const newAttemptCount = event.attempt_count + 1;
    const shouldRetry = newAttemptCount < event.max_retries;

    // Calculate exponential backoff: 1s, 2s, 4s, 8s...
    let nextRetryAt: string | null = null;
    let newStatus: 'RETRYING' | 'DEAD_LETTER' = 'DEAD_LETTER';

    if (shouldRetry) {
      const backoffMs = Math.min(1000 * Math.pow(2, event.attempt_count), 60000); // Cap at 60s
      nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
      newStatus = 'RETRYING';
    }

    // Add to error history
    const errorHistory = (event.error_history || []) as Array<{ attempt: number; timestamp: string; code: string; message: string }>;
    errorHistory.push({
      attempt: newAttemptCount,
      timestamp: new Date().toISOString(),
      code: errorCode,
      message: errorMessage,
    });

    // Update event
    const { error: updateError } = await supabase
      .from('waba_outbound_events')
      .update({
        status: newStatus,
        attempt_count: newAttemptCount,
        last_error_code: errorCode,
        last_error_message: errorMessage,
        error_history: errorHistory,
        next_retry_at: nextRetryAt,
        dead_lettered_at: shouldRetry ? null : new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateError) {
      logger.error('outbound_event.mark_failed_failed', {
        error: updateError.message,
        eventId,
      });
      throw updateError;
    }

    if (shouldRetry) {
      logger.info('outbound_event.scheduled_retry', {
        eventId,
        attemptNumber: newAttemptCount,
        nextRetryAt,
        errorCode,
      });
    } else {
      logger.error('outbound_event.dead_lettered', {
        eventId,
        attemptCount: newAttemptCount,
        lastErrorCode: errorCode,
      });
    }

    return { shouldRetry, nextRetryAt };
  }

  /**
   * Get all pending events that are ready to retry.
   * Used by retry worker to pick up events.
   */
  static async getPendingRetries(
    supabase: SupabaseClient,
    limit: number = 100
  ): Promise<OutboundEventRecord[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('waba_outbound_events')
      .select('*')
      .in('status', ['PENDING', 'RETRYING'])
      .or(`next_retry_at.lte.${now},next_retry_at.is.null`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('outbound_event.fetch_retries_failed', {
        error: error.message,
      });
      return [];
    }

    return data || [];
  }

  /**
   * Get all dead-lettered events (for admin review).
   */
  static async getDeadLetterEvents(
    supabase: SupabaseClient,
    limit: number = 50
  ): Promise<OutboundEventRecord[]> {
    const { data, error } = await supabase
      .from('waba_outbound_events')
      .select('*')
      .eq('status', 'DEAD_LETTER')
      .order('dead_lettered_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('outbound_event.fetch_dead_letters_failed', {
        error: error.message,
      });
      return [];
    }

    return data || [];
  }

  /**
   * Replay a dead-lettered event (admin action).
   * Resets attempt count and marks as PENDING.
   */
  static async replayDeadLetteredEvent(
    supabase: SupabaseClient,
    eventId: string,
    replayedBy: string
  ): Promise<OutboundEventRecord> {
    const { data, error } = await supabase
      .from('waba_outbound_events')
      .update({
        status: 'PENDING',
        attempt_count: 0,
        next_retry_at: new Date().toISOString(),
        dead_lettered_at: null,
        last_error_code: null,
        last_error_message: null,
        error_history: [],
      })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) {
      logger.error('outbound_event.replay_failed', {
        error: error.message,
        eventId,
      });
      throw error;
    }

    logger.info('outbound_event.replayed', {
      eventId,
      replayedBy,
    });

    return data;
  }

  /**
   * Get metrics for a time window (for dashboards).
   */
  static async getMetrics(
    supabase: SupabaseClient,
    windowHours: number = 24
  ): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalDeadLettered: number;
    deliveryRate: number;
    failureRate: number;
  }> {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('waba_outbound_events')
      .select('status, COUNT(*) as count', { count: 'exact' })
      .gte('created_at', since)
      .group_by('status');

    if (error) {
      logger.error('outbound_event.get_metrics_failed', { error: error.message });
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalDeadLettered: 0,
        deliveryRate: 0,
        failureRate: 0,
      };
    }

    const stats: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      stats[row.status] = row.count;
    });

    const totalSent = Object.values(stats).reduce((a, b) => a + b, 0) as number;
    const totalDelivered = stats['DELIVERED'] || 0;
    const totalFailed = stats['FAILED'] || 0;
    const totalDeadLettered = stats['DEAD_LETTER'] || 0;

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalDeadLettered,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      failureRate: totalSent > 0 ? Math.round(((totalFailed + totalDeadLettered) / totalSent) * 100) : 0,
    };
  }
}
