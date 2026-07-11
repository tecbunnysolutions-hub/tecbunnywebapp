import { Worker } from 'bullmq';
import { EMAIL_QUEUE_NAME, getRedisConnection, type OrderConfirmationEmailJobData } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core';
import { emailHelpers } from '@tecbunny/core/email';

export function startEmailWorker() {
  const worker = new Worker<OrderConfirmationEmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      logger.info('Processing email job', { jobId: job.id, name: job.name });
      if (job.name === 'order_confirmation') {
        const { recipient, orderData } = job.data;
        await emailHelpers.sendOrderConfirmation(recipient, orderData);
        logger.info('Order confirmation email sent successfully via background worker', { recipient, orderId: orderData.id });
      }
    },
    { connection: getRedisConnection() as any }
  );

  worker.on('failed', (job, err) => {
    logger.error('Email worker failed job', { jobId: job?.id, error: err.message });
  });

  return worker;
}
