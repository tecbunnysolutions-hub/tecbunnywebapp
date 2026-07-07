const fs = require('fs');
const apps = ['api', 'mgmt', 'public', 'superadmin'];
const ts = `export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}`;
const nodeTs = `import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'tecbunny-app',
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  })),
});

sdk.start();`;

apps.forEach(app => {
  const basePath = `apps/${app}${app === 'public' ? '/src' : '/src'}`; // all use src now
  fs.writeFileSync(`${basePath}/instrumentation.ts`, ts);
  fs.writeFileSync(`${basePath}/instrumentation.node.ts`, nodeTs);
});
