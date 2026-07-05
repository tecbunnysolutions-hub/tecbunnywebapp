import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { supabaseAdmin } from './supabase-server';

// Requires a REDIS_URL in the .env file
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Define the Queue
export const whatsappQueue = new Queue('whatsapp-outbound', { 
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

// Define the Worker (Consumes jobs from the queue)
// In a serverless environment like Vercel, workers usually run as separate persistent processes
// For now, this worker can run locally or on a persistent server
export const worker = new Worker('whatsapp-outbound', async (job: Job) => {
  const { tenant_id, waba_account_id, access_token, to, message } = job.data;

  // 1. Send to Meta API using native fetch
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${waba_account_id}/messages`,
    {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }

  // 2. Log success in database (Using service client)
  await supabaseAdmin.from('messages').insert({
    tenant_id,
    waba_message_id: result.messages[0].id,
    receiver_number: to,
    sender_number: "SYSTEM", // Should be replaced with actual sender number ID
    content: message,
    status: 'sent'
  });
  
  return result;
}, { 
  connection: connection as any,
  concurrency: 10,
  limiter: {
    max: 80,
    duration: 1000 
  }
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed for tenant ${job?.data.tenant_id}:`, err.message);
});
