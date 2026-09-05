import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.resolve(root, process.argv[2] ?? 'runtime-readiness-evidence.json');
const strict = !(process.argv.find((arg) => arg === '--mode=advisory'));

if (!existsSync(manifestPath)) {
  console.error(`Runtime readiness manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const findings = [];
  const warnings = [];
  const now = Date.now();
  const maxAgeDays = Number(manifest.policy?.maxEvidenceAgeDays ?? 14);

  for (const [categoryKey, category] of Object.entries(manifest.categories ?? {})) {
    for (const check of category.checks ?? []) {
      const id = String(check.id ?? 'unknown');
      const status = String(check.status ?? '').toLowerCase();
      if (status !== 'pass') {
        (strict ? findings : warnings).push(`[${categoryKey}] ${id} is not passing (status=${status || 'unset'})`);
      }

      const verifiedAt = Date.parse(String(check.lastVerifiedAt ?? ''));
      if (!Number.isFinite(verifiedAt)) {
        findings.push(`[${categoryKey}] ${id} has invalid or missing lastVerifiedAt`);
      } else if ((now - verifiedAt) / 86400000 > maxAgeDays) {
        (strict ? findings : warnings).push(`[${categoryKey}] ${id} evidence is stale`);
      }

      if (!Array.isArray(check.evidence) || check.evidence.length === 0) {
        findings.push(`[${categoryKey}] ${id} has no evidence entries`);
      }
    }
  }

  if (warnings.length) {
    console.warn('Runtime readiness warnings:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
  if (findings.length) {
    console.error(`Runtime readiness validation failed (${strict ? 'strict' : 'advisory'} mode):`);
    findings.forEach((finding) => console.error(`- ${finding}`));
    process.exitCode = 1;
  } else {
    console.log(`Runtime readiness validation passed (${strict ? 'strict' : 'advisory'} mode).`);
  }
}