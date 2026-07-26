import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const auditPath = process.argv[2] ? join(root, process.argv[2]) : join(root, 'docs/security/npm-audit-2026-07-26.json');
const allowlistPath = process.argv[3] ? join(root, process.argv[3]) : join(root, 'docs/security/security-gate-allowlist.json');

function readJson(path) {
  const raw = readFileSync(path, 'utf8');
  const noBom = raw.replace(/^\uFEFF/, '');
  const firstBrace = noBom.indexOf('{');
  const lastBrace = noBom.lastIndexOf('}');
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? noBom.slice(firstBrace, lastBrace + 1) : noBom;
  return JSON.parse(jsonText);
}

function toDateOnly(value) {
  return new Date(`${value}T00:00:00Z`);
}

const today = new Date();
const audit = readJson(auditPath);
const allowlist = readJson(allowlistPath);
const targetSeverities = new Set((allowlist.policy?.failOnSeverities ?? ['critical', 'high']).map((s) => String(s).toLowerCase()));

const allowedPackageMap = new Map();
for (const item of allowlist.allowedPackages ?? []) {
  allowedPackageMap.set(item.name, item);
}

const failures = [];
const allowedMatches = [];

const vulnerabilities = audit.vulnerabilities ?? {};
for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
  const severity = String(vulnerability?.severity ?? '').toLowerCase();
  if (!targetSeverities.has(severity)) {
    continue;
  }

  const allow = allowedPackageMap.get(packageName);
  if (!allow) {
    failures.push(`${severity.toUpperCase()} not allowlisted: ${packageName}`);
    continue;
  }

  const packageExpiry = allow.expiresOn ?? allowlist.policy?.expiresOn;
  if (!packageExpiry) {
    failures.push(`allowlist missing expiresOn: ${packageName}`);
    continue;
  }

  if (toDateOnly(packageExpiry).getTime() < today.getTime()) {
    failures.push(`allowlist expired for ${packageName} on ${packageExpiry}`);
    continue;
  }

  allowedMatches.push(`${packageName} (${severity})`);
}

if (failures.length > 0) {
  console.error('Security gate validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  if (allowedMatches.length > 0) {
    console.log(`Security gate passed with approved exceptions: ${allowedMatches.join(', ')}`);
  } else {
    console.log('Security gate passed with no high/critical vulnerabilities.');
  }
}
