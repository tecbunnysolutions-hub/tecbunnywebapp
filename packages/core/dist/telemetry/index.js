import { registerOTel } from '@vercel/otel';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
/**
 * Registers OpenTelemetry instrumentation for a Next.js app.
 * This should be called from the `instrumentation.ts` file in the Next.js root.
 * @param serviceName The name of the service (e.g., 'api' or 'waba')
 */
export function registerTelemetry(serviceName) {
    registerOTel({
        serviceName,
    });
}
/**
 * Expose OpenTelemetry helpers for custom domain service tracing.
 */
export const telemetry = {
    trace,
    context,
    SpanStatusCode,
    /**
     * Helper to get the shared tracer for the workspace.
     */
    getTracer: (name = 'tecbunny-tracer') => trace.getTracer(name),
};
