import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Export a single connection instance to be shared across queues/workers
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Phase 1 Queues: Inbound webhook payloads
export const inboundWhatsappQueue = new Queue('inbound-whatsapp-events', { 
  connection: redisConnection as any
});

// Phase 2 Queues: Triaged intents mapped by AI agents
export const triagedIntentsQueue = new Queue('triaged-intents', { 
  connection: redisConnection as any
});

// Phase 4 Queues: Final outgoing messages to Infobip
export const outboundDeliveryQueue = new Queue('outbound-delivery', { 
  connection: redisConnection as any
});

console.log('BullMQ Queues Initialized (inbound-whatsapp-events, triaged-intents, outbound-delivery)');
