export abstract class BaseAgent<TInput, TOutput> {
  constructor(protected agentName: string) {}

  public async execute(data: TInput): Promise<TOutput | void> {
    try {
      console.log(`[${this.constructor.name}] Executing agent...`);
      const result = await this.process(data);
      console.log(`[${this.constructor.name}] Execution complete.`);
      return result;
    } catch (error) {
      console.error(`[${this.constructor.name}] Error executing agent:`, error);
      throw error;
    }
  }

  protected abstract process(data: TInput): Promise<TOutput | void>;
}
