import { OutboundEventService } from '@tecbunny/core';
import { logger } from '@tecbunny/core';
import { supabase } from '@/lib/supabase';
import { retryOutboundEvent } from '@/services/infobipService';

const ACTIVE_POLL_INTERVAL_MS = 1000;
const IDLE_POLL_INTERVAL_MS = 10000;

export function startOutboundRetryWorker() {
  let running = false;
  let closed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const processRetries = async () => {
    let claimedCount = 0;
    if (running) return;
    running = true;
    try {
      const events = await OutboundEventService.claimPendingRetries(supabase, 100);
      claimedCount = events.length;
      for (const event of events) {
        if (event.campaign_id) {
          const { data: campaign } = await supabase
            .from('mkt_campaigns')
            .select('status')
            .eq('id', event.campaign_id)
            .maybeSingle();
          if (!campaign || !['RUNNING', 'SCHEDULED'].includes(campaign.status)) {
            await OutboundEventService.markBlocked(supabase, event.id, 'CAMPAIGN_INACTIVE', 'Campaign is no longer active', event.processing_token);
            continue;
          }
        }

        if (event.requires_consent) {
          const { data: consent } = await supabase
            .from('waba_contact_consent')
            .select('opted_in, opted_out_at')
            .eq('phone', event.phone_number)
            .maybeSingle();
          if (!consent?.opted_in || consent.opted_out_at) {
            await OutboundEventService.markBlocked(supabase, event.id, 'CONSENT_REVOKED', 'Recipient consent is not active', event.processing_token);
            continue;
          }
        }

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
      if (!closed) timer = setTimeout(() => void processRetries(), claimedCount > 0 ? ACTIVE_POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS);
    }
  };

  void processRetries();

  return {
    close: async () => {
      closed = true;
      if (timer) clearTimeout(timer);
    },
  };
}