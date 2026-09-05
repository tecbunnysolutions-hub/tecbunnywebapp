import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.resolve(root, process.argv[2] ?? 'runtime-readiness-evidence.json');

if (!existsSync(manifestPath)) {
  console.error(`Runtime readiness manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const findings = [];

  for (const [categoryKey, category] of Object.entries(manifest.categories ?? {})) {
    for (const check of category.checks ?? []) {
      const status = String(check.status ?? '').toLowerCase();
      if (status !== 'pending' && status !== 'fail') continue;

      for (const evidence of check.evidence ?? []) {
        const relativePath = String(evidence);
        if (/^https?:\/\//i.test(relativePath)) continue;
        const resolved = path.resolve(root, relativePath);
        if (!existsSync(resolved)) {
          findings.push(`[${categoryKey}] ${check.id} evidence file not found: ${relativePath}`);
        } else if (statSync(resolved).size === 0) {
          findings.push(`[${categoryKey}] ${check.id} evidence file is empty: ${relativePath}`);
        }
      }
    }
  }

  if (findings.length > 0) {
    console.error('Runtime evidence artifact validation failed:');
    findings.forEach((finding) => console.error(`- ${finding}`));
    process.exitCode = 1;
  } else {
    console.log('Runtime evidence artifacts are present for pending and failing checks.');
  }
}