import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const argPath = process.argv[2];
const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = (modeArg ? modeArg.split('=')[1] : 'strict').toLowerCase();
const strict = mode !== 'advisory';

const manifestPath = argPath
  ? path.resolve(root, argPath)
  : path.join(root, 'runtime-readiness-evidence.json');

const REQUIRED_CATEGORY_KEYS = [
  'authenticationAuthorization',
  'security',
  'testing',
  'performance',
  'deployment',
];

const REQUIRED_CHECK_IDS = {
  authenticationAuthorization: [
    'api-route-auth-coverage',
    'rbac-enforcement',
    'cross-tenant-cross-branch-isolation',
    'ownership-checks',
  ],
  security: [
    'jwt-lifecycle',
    'refresh-token-rotation',
    'csrf-cookie-flows',
    'rate-limiting-runtime',
    'security-headers-runtime',
    'secret-handling-runtime',
    'owasp-top10-runtime',
  ],
  testing: [
    'ci-test-execution',
    'test-suite-pass',
    'critical-workflow-coverage',
    'coverage-targets',
  ],
  performance: [
    'build-size-report',
    'lighthouse-report',
    'core-web-vitals-report',
    'api-latency-report',
    'database-query-performance-report',
    'load-testing-report',
  ],
  deployment: [
    'production-build-verification',
    'migration-safety-rehearsal',
    'rollback-rehearsal',
    'backup-restore-rehearsal',
    'health-check-runtime',
    'monitoring-alerting-runtime',
  ],
};

function readJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function dayDiff(now, isoDate) {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24);
}

function findCheck(checks, id) {
  return (checks ?? []).find((item) => item?.id === id) ?? null;
}

function normalizeEvidencePath(evidencePath) {
  if (/^https?:\/\//i.test(evidencePath)) {
    return null;
  }
  return path.resolve(root, evidencePath);
}

function validateCheck(categoryKey, check, maxAgeDays, findings, warnings) {
  const validStatuses = new Set(['pass', 'pending', 'fail']);
  const status = String(check?.status ?? '').toLowerCase();
  const now = new Date();

  if (!validStatuses.has(status)) {
    findings.push(`[${categoryKey}] ${check?.id ?? 'unknown'} has invalid status: ${check?.status}`);
  }

  if (status !== 'pass') {
    const msg = `[${categoryKey}] ${check.id} is not passing (status=${status || 'unset'})`;
    if (strict) findings.push(msg);
    else warnings.push(msg);
  }

  const verifiedAt = check?.lastVerifiedAt;
  if (!verifiedAt) {
    findings.push(`[${categoryKey}] ${check.id} is missing lastVerifiedAt`);
  } else {
    const ageDays = dayDiff(now, verifiedAt);
    if (!Number.isFinite(ageDays)) {
      findings.push(`[${categoryKey}] ${check.id} has invalid lastVerifiedAt: ${verifiedAt}`);
    } else if (ageDays > maxAgeDays) {
      const msg = `[${categoryKey}] ${check.id} evidence is stale (${ageDays.toFixed(1)} days > ${maxAgeDays})`;
      if (strict) findings.push(msg);
      else warnings.push(msg);
    }
  }

  if (!Array.isArray(check?.evidence) || check.evidence.length === 0) {
    findings.push(`[${categoryKey}] ${check.id} has no evidence entries`);
    return;
  }

  for (const evidencePath of check.evidence) {
    const resolved = normalizeEvidencePath(String(evidencePath));
    if (!resolved) continue;
    if (!existsSync(resolved)) {
      findings.push(`[${categoryKey}] ${check.id} evidence file not found: ${evidencePath}`);
    }
  }
}

if (!existsSync(manifestPath)) {
  console.error(`Runtime readiness manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = readJson(manifestPath);
  const findings = [];
  const warnings = [];

  const maxAgeDays = Number.isFinite(manifest?.policy?.maxEvidenceAgeDays)
    ? Number(manifest.policy.maxEvidenceAgeDays)
    : 14;

  for (const categoryKey of REQUIRED_CATEGORY_KEYS) {
    const category = manifest?.categories?.[categoryKey];
    if (!category) {
      findings.push(`Missing category: ${categoryKey}`);
      continue;
    }
    const checks = Array.isArray(category.checks) ? category.checks : [];
    for (const requiredId of REQUIRED_CHECK_IDS[categoryKey]) {
      const check = findCheck(checks, requiredId);
      if (!check) {
        findings.push(`[${categoryKey}] missing required check: ${requiredId}`);
        continue;
      }
      validateCheck(categoryKey, check, maxAgeDays, findings, warnings);
    }
  }

  if (warnings.length > 0) {
    console.warn('Runtime readiness warnings:');
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (findings.length > 0) {
    console.error('Runtime readiness validation failed:');
    for (const finding of findings) {
      console.error(`- ${finding}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Validated runtime readiness evidence manifest in ${strict ? 'strict' : 'advisory'} mode.`);
  }
}