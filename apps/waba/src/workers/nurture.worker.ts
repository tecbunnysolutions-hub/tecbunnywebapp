import { Worker, Job, Queue } from 'bullmq';
import { getRedis, logger } from '@tecbunny/core/server';
import { createServiceClient } from '@tecbunny/database';

export const NURTURE_QUEUE_NAME = 'waba_nurture_queue';

// Start the scheduler that queues up nurture jobs based on cron
export function startNurtureScheduler() {
  const redisConnection = getRedis();
  if (!redisConnection) return null;

  const queue = new Queue(NURTURE_QUEUE_NAME, { connection: redisConnection as never });

  // Add a recurring job that runs once a day to evaluate all active leads
  queue.add('evaluate-nurture-steps', {}, {
    repeat: {
      pattern: '0 9 * * *' // Run at 9:00 AM every day
    },
    jobId: 'daily-nurture-evaluation'
  });

  return queue;
}

export function startNurtureWorker() {
  const redisConnection = getRedis();
  if (!redisConnection) return null;

  const worker = new Worker(NURTURE_QUEUE_NAME, async (job: Job) => {
    logger.info('Evaluating lead nurture sequences');
    const supabase = createServiceClient();

    // 1. Get all active leads
    const { data: leads } = await supabase
      .from('sls_leads')
      .select('id, heat_level, created_at, status')
      .not('status', 'eq', 'CONVERTED');

    if (!leads || leads.length === 0) return;

    // 2. Fetch active sequences and their steps
    const { data: sequences } = await supabase
      .from('sls_nurture_sequences')
      .select('id, sls_nurture_steps(id, delay_days, action_type, message_template)')
      .eq('is_active', true);

    if (!sequences || sequences.length === 0) return;

    const now = new Date();

    for (const lead of leads) {
      const daysSinceCreation = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 3600 * 24));

      for (const sequence of sequences) {
        if (!sequence.sls_nurture_steps) continue;
        
        for (const step of sequence.sls_nurture_steps as any[]) {
          // If the delay perfectly matches the age of the lead, dispatch action
          if (step.delay_days === daysSinceCreation) {
            
            if (step.action_type === 'SEND_WABA') {
              logger.info('Dispatching AI Follow-up (WABA)', { leadId: lead.id, stepId: step.id });
              // e.g. await sendWhatsAppMessage(lead.phone, step.message_template);
            } 
            else if (step.action_type === 'CREATE_TASK') {
              logger.info('Dispatching Task for Sales Exec', { leadId: lead.id, stepId: step.id });
              await supabase.from('sls_activities').insert({
                activity_type: 'FOLLOW_UP',
                title: 'Nurture Sequence Follow-up',
                description: step.message_template,
                lead_id: lead.id,
                due_date: new Date().toISOString()
              });
            }
          }
        }
      }
    }
  }, {
    connection: redisConnection as never,
    concurrency: 1
  });

  worker.on('failed', (job, err) => {
    logger.error('nurture_worker_failed', { jobId: job?.id, error: err.message });
  });

  return worker;
}
