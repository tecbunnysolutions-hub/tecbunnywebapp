import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const workspaces = ['apps', 'packages'].flatMap((group) =>
  readdirSync(join(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => join(root, group, entry.name)),
);

for (const workspace of [root, ...workspaces]) {
  const generated = ['.next', '.turbo', 'dist', 'out', 'build', 'coverage', 'storybook-static'];
  const incremental = readdirSync(workspace).filter((name) => name.endsWith('.tsbuildinfo'));
  for (const name of [...generated, ...incremental]) {
    const target = resolve(workspace, name);
    const pathFromRoot = relative(root, target);
    if (!pathFromRoot || pathFromRoot.startsWith('..')) throw new Error(`Unsafe clean target: ${target}`);
    if (!existsSync(target)) continue;
    if (dryRun) console.log(pathFromRoot);
    else rmSync(target, { recursive: true, force: true });
  }
}
console.log(dryRun ? 'Dry run: no files removed.' : 'Removed generated workspace output and caches.');
