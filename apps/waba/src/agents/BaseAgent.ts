import { Worker, Job, Queue } from 'bullmq';
import { redisConnection } from '../lib/queue';

export abstract class BaseAgent<TInput, TOutput> {
  protected worker: Worker;
  
  constructor(
    protected inputQueueName: string,
    protected outputQueue?: Queue
  ) {
    this.worker = new Worker(
      this.inputQueueName,
      async (job: Job<TInput>) => {
        try {
          console.log(`[${this.constructor.name}] Processing job ${job.id}`);
          const result = await this.process(job.data);
          
          if (result && this.outputQueue) {
            await this.outputQueue.add(job.name, result, {
              removeOnComplete: true,
              removeOnFail: false,
              attempts: 3,
              backoff: { type: 'exponential', delay: 1000 }
            });
            console.log(`[${this.constructor.name}] Job ${job.id} routed to ${this.outputQueue.name}`);
          }
        } catch (error) {
          console.error(`[${this.constructor.name}] Error processing job ${job.id}:`, error);
          throw error;
        }
      },
      { connection: redisConnection as any }
    );

    this.worker.on('failed', (job, err) => {
      console.error(`[${this.constructor.name}] Job ${job?.id} failed with error: ${err.message}`);
    });
  }

  protected abstract process(data: TInput): Promise<TOutput | void>;
}
