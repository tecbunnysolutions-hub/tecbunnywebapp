import { Queue } from 'bullmq';
import { getRedis } from '../redis';
import { logger } from '../logger';

let broadcastQueue: Queue | null = null;

export const BROADCAST_QUEUE_NAME = 'broadcast-queue';

export function getBroadcastQueue(): Queue | null {
  if (broadcastQueue) return broadcastQueue;
  
  const redisConnection = getRedis();
  if (!redisConnection) {
    logger.warn('broadcast_queue_disabled', { reason: 'Redis is not configured' });
    return null;
  }

  try {
    broadcastQueue = new Queue(BROADCAST_QUEUE_NAME, {
      connection: redisConnection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
    logger.info('broadcast_queue_initialized');
    return broadcastQueue;
  } catch (error) {
    logger.error('broadcast_queue_init_failed', { error: (error as Error).message });
    return null;
  }
}
