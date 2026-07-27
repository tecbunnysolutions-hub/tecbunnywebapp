import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestArgPath = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'runtime-readiness-evidence.json';
const manifestPath = path.resolve(root, manifestArgPath);

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const findings = [];

  for (const [categoryKey, group] of Object.entries(manifest.categories ?? {})) {
    for (const check of group.checks ?? []) {
      const status = String(check.status ?? '').toLowerCase();
      if (status !== 'pass') continue;

      const evidence = Array.isArray(check.evidence) ? check.evidence : [];
      if (evidence.length === 0) {
        findings.push(`[${categoryKey}] ${check.id} has no evidence entries`);
        continue;
      }

      for (const entry of evidence) {
        const rel = String(entry);
        if (/^https?:\/\//i.test(rel)) continue;
        const resolved = path.resolve(root, rel);
        if (!existsSync(resolved)) {
          findings.push(`[${categoryKey}] ${check.id} missing evidence file: ${rel}`);
          continue;
        }

        if (/docs\/runtime-evidence\//.test(rel.replace(/\\/g, '/'))) {
          const text = readFileSync(resolved, 'utf8');
          if (/\bTBA\b/.test(text)) {
            findings.push(`[${categoryKey}] ${check.id} has TBA markers in evidence: ${rel}`);
          }
          if (/Status:\s*Pending completion/i.test(text)) {
            findings.push(`[${categoryKey}] ${check.id} evidence still marked pending: ${rel}`);
          }
        }
      }
    }
  }

  if (findings.length > 0) {
    console.error('Runtime evidence completeness validation failed:');
    for (const finding of findings) {
      console.error(`- ${finding}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Runtime evidence completeness validation passed for all checks currently marked pass.');
  }
}
