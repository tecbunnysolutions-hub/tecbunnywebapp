import { accessSync, constants, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

function expectFile(relativePath) {
  try {
    accessSync(join(root, relativePath), constants.F_OK);
  } catch {
    failures.push(`missing file: ${relativePath}`);
  }
}

function expectContains(content, snippet, label) {
  if (!content.includes(snippet)) {
    failures.push(`missing ${label}: ${snippet}`);
  }
}

const dockerComposePath = join(root, 'docker-compose.yml');
const dockerCompose = readFileSync(dockerComposePath, 'utf8');

for (const dockerfile of [
  'apps/api/Dockerfile',
  'apps/public/Dockerfile',
  'apps/mgmt/Dockerfile',
  'apps/superadmin/Dockerfile',
  'apps/waba/Dockerfile',
]) {
  expectFile(dockerfile);
}

expectContains(dockerCompose, 'redis:', 'docker compose service');
expectContains(dockerCompose, 'api:', 'docker compose service');
expectContains(dockerCompose, 'public:', 'docker compose service');
expectContains(dockerCompose, 'mgmt:', 'docker compose service');
expectContains(dockerCompose, 'waba:', 'docker compose service');
expectContains(dockerCompose, 'healthcheck:', 'docker healthcheck block');
expectContains(dockerCompose, 'service_healthy', 'health-based dependency gating');

for (const healthRoute of [
  'apps/api/src/app/api/health/route.ts',
  'apps/api/src/app/api/health/summary/route.ts',
  'apps/api/src/app/health/route.ts',
  'apps/api/src/app/ready/route.ts',
  'apps/api/src/app/live/route.ts',
]) {
  expectFile(healthRoute);
}

const proxyPath = join(root, 'apps/api/src/proxy.ts');
const proxyContent = readFileSync(proxyPath, 'utf8');
expectContains(proxyContent, "'/api/health'", 'public route health exposure');

if (failures.length > 0) {
  console.error('Infra/observability readiness validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('Validated infra/observability readiness contract (Docker, health endpoints, proxy exposure).');
}
