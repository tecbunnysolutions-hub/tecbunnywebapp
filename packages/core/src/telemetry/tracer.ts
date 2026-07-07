import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('tecbunny-core');

export async function withTrace<T>(spanName: string, fn: () => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      if (error instanceof Error) {
        span.recordException(error);
      }
      throw error;
    } finally {
      span.end();
    }
  });
}
