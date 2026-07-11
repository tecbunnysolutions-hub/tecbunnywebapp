import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

export const EMAIL_QUEUE_NAME = 'email_dispatch_queue';

let emailQueue: Queue | null = null;

export function getEmailQueue(): Queue {
  if (!emailQueue) {
    emailQueue = new Queue(EMAIL_QUEUE_NAME, {
      connection: getRedisConnection() as any,
    });
  }
  return emailQueue;
}

export interface OrderConfirmationEmailJobData {
  recipient: string;
  orderData: {
    id: string;
    customer_name: string;
    created_at: string;
    total: number;
    delivery_address: any;
  };
}

export async function enqueueOrderConfirmationEmail(data: OrderConfirmationEmailJobData) {
  const queue = getEmailQueue();
  await queue.add('order_confirmation', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  });
}
