import { Worker } from 'bullmq';
import { getRedisConnection } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core';
import { BROADCAST_QUEUE_NAME } from '@tecbunny/core/queue';
import { supabase } from '@/lib/supabase';
import { sendTemplateMessage } from '@/services/infobipService';
import crypto from 'crypto';

export interface BroadcastJobData {
  campaign_id: string;
  phone: string;
  template_name: string;
  language: string;
  payload: Record<string, unknown>;
}

export function startBroadcastWorker() {
  const worker = new Worker<BroadcastJobData>(
    BROADCAST_QUEUE_NAME,
    async (job) => {
      logger.info('Processing broadcast job', { jobId: job.id, phone: job.data.phone });

      const { campaign_id, phone, template_name, payload } = job.data;
      const placeholders = Array.isArray(payload?.placeholders)
        ? payload.placeholders.map((value) => String(value))
        : [];

      const response = await sendTemplateMessage(phone, template_name, placeholders);
      if (!response.success) {
        await supabase.from('mkt_campaign_analytics').insert({
          id: crypto.randomUUID(),
          campaign_id,
          phone,
          status: 'FAILED',
        }).then(({ error }) => {
          if (error) logger.warn('Broadcast failure log skipped', { campaign_id, phone, error: error.message });
        });
        throw new Error(`Template send failed: ${JSON.stringify(response.error ?? response.status ?? 'unknown')}`);
      }

      const providerMessageId = (response.data as { messages?: Array<{ messageId?: string }> })?.messages?.[0]?.messageId;

      await supabase.from('Message').insert({
        id: crypto.randomUUID(),
        message_id: providerMessageId,
        sender_number: phone,
        direction: 'OUTBOUND',
        message_content: `[Campaign Template Queued: ${template_name}]`,
        timestamp: new Date().toISOString(),
        status: 'SENT',
        sent_by: 'ADMIN',
      }).then(({ error }) => {
        if (error) logger.warn('Broadcast message log skipped', { campaign_id, phone, error: error.message });
      });

      await supabase.from('mkt_campaign_analytics').insert({
        id: crypto.randomUUID(),
        campaign_id,
        phone,
        message_id: providerMessageId,
        status: 'SENT',
      }).then(({ error }) => {
        if (error) logger.warn('Broadcast campaign log skipped', { campaign_id, phone, error: error.message });
      });

      logger.info('Broadcast message dispatched', { campaign_id, phone, template_name });
    },
    {
      connection: getRedisConnection() as never,
      concurrency: 5 // Rate limit compliance
    }
  );

  worker.on('failed', (job, err) => {
    logger.error('Broadcast worker failed job', { jobId: job?.id, error: err.message });
  });

  return worker;
}
