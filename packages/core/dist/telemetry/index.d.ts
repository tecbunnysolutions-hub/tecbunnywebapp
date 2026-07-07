import { SpanStatusCode } from '@opentelemetry/api';
/**
 * Registers OpenTelemetry instrumentation for a Next.js app.
 * This should be called from the `instrumentation.ts` file in the Next.js root.
 * @param serviceName The name of the service (e.g., 'api' or 'waba')
 */
export declare function registerTelemetry(serviceName: string): void;
/**
 * Expose OpenTelemetry helpers for custom domain service tracing.
 */
export declare const telemetry: {
    trace: import("@opentelemetry/api").TraceAPI;
    context: import("@opentelemetry/api").ContextAPI;
    SpanStatusCode: typeof SpanStatusCode;
    /**
     * Helper to get the shared tracer for the workspace.
     */
    getTracer: (name?: string) => import("@opentelemetry/api").Tracer;
};
//# sourceMappingURL=index.d.ts.map