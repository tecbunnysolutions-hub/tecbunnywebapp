import { OutboundEventService } from '@tecbunny/core';
import { logger } from '@tecbunny/core';
import { supabase } from '@/lib/supabase';
import { retryOutboundEvent } from '@/services/infobipService';

const POLL_INTERVAL_MS = 1000;

export function startOutboundRetryWorker() {
  let running = false;

  const processRetries = async () => {
    if (running) return;
    running = true;
    try {
      const events = await OutboundEventService.claimPendingRetries(supabase, 100);
      for (const event of events) {
        await OutboundEventService.recordRetryAttempt(supabase, event.id, event, 0);
        const result = await retryOutboundEvent(event);
        if (!result.success) {
          logger.warn('outbound_retry_failed', {
            eventId: event.id,
            status: result.status,
          });
        }
      }
    } catch (error) {
      logger.error('outbound_retry_worker_failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void processRetries(), POLL_INTERVAL_MS);
  void processRetries();

  return {
    close: async () => clearInterval(timer),
  };
}