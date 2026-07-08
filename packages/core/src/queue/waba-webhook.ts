import { Queue } from 'bullmq';
import { getRedis } from '../redis';
import { logger } from '../logger';

let wabaWebhookQueue: Queue | null = null;

export const WABA_WEBHOOK_QUEUE_NAME = 'waba-webhook-queue';

export function getWabaWebhookQueue(): Queue | null {
  if (wabaWebhookQueue) return wabaWebhookQueue;
  
  const redisConnection = getRedis();
  if (!redisConnection) {
    logger.warn('waba_webhook_queue_disabled', { reason: 'Redis is not configured' });
    return null;
  }

  try {
    wabaWebhookQueue = new Queue(WABA_WEBHOOK_QUEUE_NAME, {
      connection: redisConnection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
    logger.info('waba_webhook_queue_initialized');
    return wabaWebhookQueue;
  } catch (error) {
    logger.error('waba_webhook_queue_init_failed', { error: (error as Error).message });
    return null;
  }
}
