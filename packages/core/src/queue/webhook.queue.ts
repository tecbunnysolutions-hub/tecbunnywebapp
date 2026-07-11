import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

export const WEBHOOK_QUEUE_NAME = 'webhook_dispatch_queue';

let webhookQueue: Queue | null = null;

export function getWebhookQueue(): Queue {
  if (!webhookQueue) {
    webhookQueue = new Queue(WEBHOOK_QUEUE_NAME, {
      connection: getRedisConnection() as any,
    });
  }
  return webhookQueue;
}

export interface PaymentRecoveryWebhookJobData {
  url: string;
  payload: any;
  headers?: Record<string, string>;
}

export async function enqueuePaymentRecoveryWebhook(data: PaymentRecoveryWebhookJobData) {
  const queue = getWebhookQueue();
  await queue.add('payment_recovery', data, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
  });
}
