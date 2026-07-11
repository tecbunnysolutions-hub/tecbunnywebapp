import { Worker } from 'bullmq';
import { WEBHOOK_QUEUE_NAME, getRedisConnection, type PaymentRecoveryWebhookJobData } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core';

export function startWebhookWorker() {
  const worker = new Worker<PaymentRecoveryWebhookJobData>(
    WEBHOOK_QUEUE_NAME,
    async (job) => {
      logger.info('Processing webhook job', { jobId: job.id, name: job.name });
      if (job.name === 'payment_recovery') {
        const { url, payload, headers } = job.data;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(headers || {})
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status: ${response.status}`);
        }
        logger.info('Webhook dispatched successfully via background worker', { url });
      }
    },
    { connection: getRedisConnection() as any }
  );

  worker.on('failed', (job, err) => {
    logger.error('Webhook worker failed job', { jobId: job?.id, error: err.message });
  });

  return worker;
}
