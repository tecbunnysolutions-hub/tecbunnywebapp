import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.resolve(root, process.argv[2] ?? 'runtime-readiness-evidence.json');
const findings = [];

if (!existsSync(manifestPath)) {
  findings.push(`manifest not found: ${manifestPath}`);
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const [categoryKey, category] of Object.entries(manifest.categories ?? {})) {
    for (const check of category.checks ?? []) {
      if (String(check.status).toLowerCase() !== 'pass') continue;
      if (!check.evidence?.length) findings.push(`[${categoryKey}] ${check.id} has no evidence`);
      for (const evidence of check.evidence ?? []) {
        if (/^https?:\/\//i.test(evidence)) continue;
        const resolved = path.resolve(root, evidence);
        if (!existsSync(resolved)) findings.push(`[${categoryKey}] ${check.id} missing ${evidence}`);
      }
    }
  }
}

if (findings.length) {
  console.error('Runtime evidence completeness validation failed:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log('Runtime evidence completeness validation passed.');
}