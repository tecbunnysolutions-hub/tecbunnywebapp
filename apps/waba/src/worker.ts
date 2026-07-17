import { Worker, Job } from 'bullmq';
import { getRedis, logger, WABA_WEBHOOK_QUEUE_NAME } from '@tecbunny/core/server';
import { InboundTriageAgent } from './agents/InboundTriageAgent';
import { AssignmentOrchestrator } from './agents/AssignmentOrchestrator';
import { startEmailWorker, startWebhookWorker, startNurtureScheduler, startNurtureWorker } from './workers';
import { RuleEngineService } from './services/RuleEngineService';

async function startWorker() {
  const redisConnection = getRedis();
  
  if (!redisConnection) {
    logger.error('waba_worker_failed', { reason: 'Redis connection is not available' });
    process.exit(1);
  }

  // Initialize Background Workers
  console.log('Starting Background BullMQ Workers...');
  const emailWorker = startEmailWorker();
  const webhookWorker = startWebhookWorker();
  const nurtureScheduler = startNurtureScheduler();
  const nurtureWorker = startNurtureWorker();

  const worker = new Worker(WABA_WEBHOOK_QUEUE_NAME, async (job: Job) => {
    try {
      const body = job.data;
      logger.info('waba_worker_processing_job', { jobId: job.id });

      const triageAgent = new InboundTriageAgent();
      const orchestrator = new AssignmentOrchestrator();

      // 1. Process incoming message and triage
      const triageResult = await triageAgent.execute(body);

      // 2. Evaluate Rule Engine to see if an automated workflow should take over
      let ruleEngineHandled = false;
      if (triageResult) {
        ruleEngineHandled = await RuleEngineService.evaluateRules(triageResult);
      }

      // 3. If the message was actionable and not fully handled by RuleEngine, assign to manager
      if (triageResult && !ruleEngineHandled) {
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
    connection: redisConnection as never,
    concurrency: 5,
  });

  worker.on('ready', () => {
    logger.info('waba_worker_ready', { queue: WABA_WEBHOOK_QUEUE_NAME });
  });

  worker.on('error', (err) => {
    logger.error('waba_worker_error', { error: err.message });
  });
  
  // Handle graceful shutdown
  const gracefulShutdown = async () => {
    logger.info('waba_worker_shutting_down');
    await worker.close();
    await emailWorker.close();
    await webhookWorker.close();
    if (nurtureScheduler) await nurtureScheduler.close();
    if (nurtureWorker) await nurtureWorker.close();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startWorker().catch((error) => {
  console.error('RAW FATAL ERROR:', error);
  logger.error('waba_worker_fatal_error', { error: error.message });
  process.exit(1);
});
