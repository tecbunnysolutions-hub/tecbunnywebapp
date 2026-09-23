import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Check the repository instead of self-reported scores in an audit document.
const root = fileURLToPath(new URL('..', import.meta.url));
const gates = [
  'validate-architecture.mjs',
  'validate-api-boundary.mjs',
  'validate-db-readiness.mjs',
  'validate-runtime-evidence-artifacts.mjs',
  'validate-runtime-evidence-completeness.mjs',
];

for (const gate of gates) {
  const result = spawnSync(process.execPath, [`scripts/${gate}`], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error(`Launch readiness gate failed: ${gate}`);
    process.exit(result.status || 1);
  }
}
console.log('Launch readiness repository checks passed. Run strict runtime checks before release.');
