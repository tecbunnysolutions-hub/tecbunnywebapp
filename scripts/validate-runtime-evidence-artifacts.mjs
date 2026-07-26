import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestArgPath = process.argv[2];
const manifestPath = manifestArgPath
  ? path.resolve(root, manifestArgPath)
  : path.join(root, 'runtime-readiness-evidence.json');

const REQUIRED_RUNTIME_ARTIFACTS = {
  'api-route-auth-coverage': [
    'docs/runtime-evidence/api-route-auth-coverage-runtime.md',
  ],
  'rbac-enforcement': [
    'docs/runtime-evidence/rbac-enforcement-runtime.md',
  ],
  'cross-tenant-cross-branch-isolation': [
    'docs/runtime-evidence/tenant-branch-isolation-runtime.md',
  ],
  'ownership-checks': [
    'docs/runtime-evidence/ownership-checks-runtime.md',
  ],
  'jwt-lifecycle': [
    'docs/runtime-evidence/jwt-lifecycle-runtime.md',
  ],
  'refresh-token-rotation': [
    'docs/runtime-evidence/refresh-token-rotation-runtime.md',
  ],
  'csrf-cookie-flows': [
    'docs/runtime-evidence/csrf-cookie-flows-runtime.md',
  ],
  'rate-limiting-runtime': [
    'docs/runtime-evidence/rate-limiting-runtime.md',
  ],
  'security-headers-runtime': [
    'docs/runtime-evidence/security-headers-runtime.md',
  ],
  'secret-handling-runtime': [
    'docs/runtime-evidence/secret-handling-runtime.md',
  ],
  'owasp-top10-runtime': [
    'docs/runtime-evidence/owasp-top10-runtime.md',
  ],
  'critical-workflow-coverage': [
    'docs/runtime-evidence/critical-workflow-coverage-runtime.md',
  ],
  'coverage-targets': [
    'docs/runtime-evidence/coverage-targets-runtime.md',
  ],
  'build-size-report': [
    'docs/runtime-evidence/build-size-report-runtime.md',
  ],
  'lighthouse-report': [
    'docs/runtime-evidence/lighthouse-runtime.md',
  ],
  'core-web-vitals-report': [
    'docs/runtime-evidence/core-web-vitals-runtime.md',
  ],
  'api-latency-report': [
    'docs/runtime-evidence/api-latency-runtime.md',
  ],
  'database-query-performance-report': [
    'docs/runtime-evidence/database-query-performance-runtime.md',
  ],
  'load-testing-report': [
    'docs/runtime-evidence/load-testing-runtime.md',
  ],
  'production-build-verification': [
    'docs/runtime-evidence/production-build-rehearsal.md',
  ],
  'migration-safety-rehearsal': [
    'docs/runtime-evidence/migration-safety-rehearsal.md',
  ],
  'rollback-rehearsal': [
    'docs/runtime-evidence/rollback-rehearsal.md',
  ],
  'backup-restore-rehearsal': [
    'docs/runtime-evidence/backup-restore-rehearsal.md',
  ],
  'health-check-runtime': [
    'docs/runtime-evidence/health-check-runtime.md',
  ],
  'monitoring-alerting-runtime': [
    'docs/runtime-evidence/monitoring-alerting-runtime.md',
  ],
};

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function flattenChecks(manifest) {
  const categories = manifest?.categories ?? {};
  const rows = [];
  for (const [categoryKey, category] of Object.entries(categories)) {
    const checks = Array.isArray(category?.checks) ? category.checks : [];
    for (const check of checks) {
      rows.push({ categoryKey, check });
    }
  }
  return rows;
}

if (!existsSync(manifestPath)) {
  console.error(`Runtime readiness manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = readJson(manifestPath);
  const findings = [];

  for (const { categoryKey, check } of flattenChecks(manifest)) {
    const checkId = String(check?.id ?? '');
    if (!checkId || !Object.prototype.hasOwnProperty.call(REQUIRED_RUNTIME_ARTIFACTS, checkId)) {
      continue;
    }

    const status = String(check?.status ?? '').toLowerCase();
    if (status !== 'pending' && status !== 'fail') {
      continue;
    }

    const requiredArtifacts = REQUIRED_RUNTIME_ARTIFACTS[checkId];
    const evidenceEntries = Array.isArray(check?.evidence)
      ? check.evidence.map((entry) => String(entry))
      : [];

    for (const requiredArtifact of requiredArtifacts) {
      if (!evidenceEntries.includes(requiredArtifact)) {
        findings.push(`[${categoryKey}] ${checkId} missing required evidence reference: ${requiredArtifact}`);
        continue;
      }

      const resolved = path.resolve(root, requiredArtifact);
      if (!existsSync(resolved)) {
        findings.push(`[${categoryKey}] ${checkId} evidence artifact file not found: ${requiredArtifact}`);
        continue;
      }

      const size = statSync(resolved).size;
      if (size === 0) {
        findings.push(`[${categoryKey}] ${checkId} evidence artifact is empty: ${requiredArtifact}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error('Runtime evidence artifact validation failed:');
    for (const finding of findings) {
      console.error(`- ${finding}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Runtime evidence artifact validation passed for all pending/failing release-gate checks.');
  }
}
