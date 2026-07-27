import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestArg = process.argv[2] ?? 'runtime-readiness-evidence.json';
const manifestPath = path.resolve(root, manifestArg);

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exitCode = 1;
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const pending = [];

  for (const [categoryKey, category] of Object.entries(manifest.categories ?? {})) {
    for (const check of category.checks ?? []) {
      const status = String(check.status ?? '').toLowerCase();
      if (status !== 'pass') {
        pending.push({
          category: categoryKey,
          id: check.id,
          status,
        });
      }
    }
  }

  console.log(`pending_count=${pending.length}`);
  for (const row of pending) {
    console.log(`${row.category}:${row.id}:${row.status}`);
  }
}
