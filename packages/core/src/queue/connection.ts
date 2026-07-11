import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { envConfig } from '../environment-validator';

// Singleton Redis connection for BullMQ
let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
    });
  }
  return redisConnection;
}
