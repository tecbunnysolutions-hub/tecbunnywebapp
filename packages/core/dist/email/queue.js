import { Queue } from 'bullmq';
import { getRedis } from '../redis';
import { logger } from '../logger';
let emailQueue = null;
export function getEmailQueue() {
    if (emailQueue)
        return emailQueue;
    const redisConnection = getRedis();
    if (!redisConnection) {
        logger.warn('email_queue_disabled', { reason: 'Redis is not configured' });
        return null;
    }
    try {
        emailQueue = new Queue('email-delivery', {
            connection: redisConnection,
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
        logger.info('email_queue_initialized');
        return emailQueue;
    }
    catch (error) {
        logger.error('email_queue_init_failed', { error: error.message });
        return null;
    }
}
