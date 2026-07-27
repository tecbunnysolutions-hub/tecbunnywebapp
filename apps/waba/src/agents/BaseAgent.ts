import { logger } from '@tecbunny/core/logger';

export abstract class BaseAgent<TInput, TOutput> {
  constructor(protected agentName: string) {}

  public async execute(data: TInput): Promise<TOutput | void> {
    try {
      logger.info('waba_agent_execute_started', { agentName: this.constructor.name });
      const result = await this.process(data);
      logger.info('waba_agent_execute_completed', { agentName: this.constructor.name });
      return result;
    } catch (error) {
      logger.error('waba_agent_execute_failed', {
        agentName: this.constructor.name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  protected abstract process(data: TInput): Promise<TOutput | void>;
}
