import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';
import { logger } from '../logger';

// Create a generic Event Bus queue
export const eventBusQueue = new Queue('event-bus', {
  connection: getRedisConnection() as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export interface EventPayload<T = unknown> {
  eventName: string;
  payload: T;
  timestamp: string;
  source?: string;
}

/**
 * Publish an event to the shared event bus queue.
 * @param eventName The name of the event (e.g., 'ORDER_CREATED')
 * @param payload The event payload
 * @param source Optional source identifier (e.g., 'api', 'waba')
 */
export async function publishEvent<T>(eventName: string, payload: T, source?: string) {
  try {
    const data: EventPayload<T> = {
      eventName,
      payload,
      timestamp: new Date().toISOString(),
      source,
    };

    // Use eventName as the job name
    await eventBusQueue.add(eventName, data);
    logger.debug(`Published event: ${eventName}`, { eventName, source });
  } catch (error) {
    logger.error(`Failed to publish event: ${eventName}`, { error: error instanceof Error ? error.message : String(error) });
  }
}
