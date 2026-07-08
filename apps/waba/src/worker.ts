import { Worker, Job } from 'bullmq';
import { getRedis, logger, WABA_WEBHOOK_QUEUE_NAME } from '@tecbunny/core/server';
import { InboundTriageAgent } from './agents/InboundTriageAgent';
import { AssignmentOrchestrator } from './agents/AssignmentOrchestrator';

async function startWorker() {
  const redisConnection = getRedis();
  
  if (!redisConnection) {
    logger.error('waba_worker_failed', { reason: 'Redis connection is not available' });
    process.exit(1);
  }

  const worker = new Worker(WABA_WEBHOOK_QUEUE_NAME, async (job: Job) => {
    try {
      const body = job.data;
      logger.info('waba_worker_processing_job', { jobId: job.id });

      const triageAgent = new InboundTriageAgent();
      const orchestrator = new AssignmentOrchestrator();

      // 1. Process incoming message and triage
      const triageResult = await triageAgent.execute(body);

      // 2. If the message was actionable and actionable payload was returned, assign to manager
      if (triageResult) {
        await orchestrator.execute(triageResult);
      }
      
      logger.info('waba_worker_job_completed', { jobId: job.id });
    } catch (error) {
      logger.error('waba_worker_job_failed', { 
        jobId: job.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, {
    connection: redisConnection as any,
    concurrency: 5,
  });

  worker.on('ready', () => {
    logger.info('waba_worker_ready', { queue: WABA_WEBHOOK_QUEUE_NAME });
  });

  worker.on('error', (err) => {
    logger.error('waba_worker_error', { error: err.message });
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('waba_worker_shutting_down');
    await worker.close();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    logger.info('waba_worker_shutting_down');
    await worker.close();
    process.exit(0);
  });
}

startWorker().catch((error) => {
  logger.error('waba_worker_fatal_error', { error: error.message });
  process.exit(1);
});
