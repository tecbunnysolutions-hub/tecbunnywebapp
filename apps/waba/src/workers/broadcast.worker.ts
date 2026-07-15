import { Worker } from 'bullmq';
import { getRedisConnection } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core';
import { BROADCAST_QUEUE_NAME } from '@tecbunny/core/queue';

export interface BroadcastJobData {
  campaign_id: string;
  phone: string;
  template_name: string;
  language: string;
  payload: any;
}

export function startBroadcastWorker() {
  const worker = new Worker<BroadcastJobData>(
    BROADCAST_QUEUE_NAME,
    async (job) => {
      logger.info('Processing broadcast job', { jobId: job.id, phone: job.data.phone });
      
      const { campaign_id, phone, template_name, language, payload } = job.data;
      
      // Here we would integrate with the actual WhatsApp Business API provider
      // (e.g. Infobip, Twilio, or Meta Cloud API) to send the template message.
      
      logger.info('Broadcast message dispatched', { campaign_id, phone, template_name });
      
      // Update CampaignLog in DB would happen here
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
