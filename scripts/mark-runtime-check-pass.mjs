import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestArgPath = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'runtime-readiness-evidence.json';
const checkIdArg = process.argv.find((arg) => arg.startsWith('--check-id='));
const noteArg = process.argv.find((arg) => arg.startsWith('--note='));
const force = process.argv.includes('--force');

if (!checkIdArg) {
  console.error('Missing required argument: --check-id=<check-id>');
  process.exitCode = 1;
} else {
  const manifestPath = path.resolve(root, manifestArgPath);

  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exitCode = 1;
  } else {
    const checkId = checkIdArg.split('=')[1];
    const note = noteArg ? noteArg.slice('--note='.length) : 'Validated in staging with attached runtime evidence.';
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    let target = null;
    let categoryKey = '';
    for (const [category, group] of Object.entries(manifest.categories ?? {})) {
      for (const check of group.checks ?? []) {
        if (check.id === checkId) {
          target = check;
          categoryKey = category;
          break;
        }
      }
      if (target) break;
    }

    if (!target) {
      console.error(`Check ID not found in manifest: ${checkId}`);
      process.exitCode = 1;
    } else {
      const evidence = Array.isArray(target.evidence) ? target.evidence : [];
      const findings = [];

      for (const entry of evidence) {
        const rel = String(entry);
        if (/^https?:\/\//i.test(rel)) continue;
        const resolved = path.resolve(root, rel);
        if (!existsSync(resolved)) {
          findings.push(`missing evidence file: ${rel}`);
          continue;
        }

        if (/docs\/runtime-evidence\//.test(rel.replace(/\\/g, '/'))) {
          const text = readFileSync(resolved, 'utf8');
          if (/\bTBA\b/.test(text)) {
            findings.push(`runtime evidence still contains TBA markers: ${rel}`);
          }
          if (/Status:\s*Pending completion/i.test(text)) {
            findings.push(`runtime evidence still marked Pending completion: ${rel}`);
          }
        }
      }

      if (!force && findings.length > 0) {
        console.error(`Cannot mark ${checkId} as pass due to incomplete evidence:`);
        for (const finding of findings) {
          console.error(`- ${finding}`);
        }
        process.exitCode = 1;
      } else {
        const now = new Date().toISOString();
        target.status = 'pass';
        target.lastVerifiedAt = now;
        target.notes = note;

        writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        console.log(`Updated [${categoryKey}] ${checkId} => pass at ${now}`);
      }
    }
  }
}
