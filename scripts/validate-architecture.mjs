import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const violations = [];

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') return [];
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

function assert(condition, message) {
  if (!condition) violations.push(message);
}

for (const app of readdirSync(join(root, 'apps'), { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  assert(existsSync(join(root, 'apps', app.name, 'package.json')), `apps/${app.name} must have a package.json so Turbo can manage it.`);
}

const domainManifest = JSON.parse(readFileSync(join(root, 'packages/domain/package.json'), 'utf8'));
assert(Object.keys(domainManifest.dependencies ?? {}).length === 0, '@tecbunny/domain must remain framework and infrastructure independent.');

const boundaryRules = [
  { directory: 'packages/domain/src', forbidden: /@tecbunny\/(core|database|infra|rpc|ui|admin-ui)/, name: 'domain' },
  { directory: 'packages/ui/src', forbidden: /@tecbunny\/(core|database|infra|rpc)/, name: 'base UI', ignore: /[\\/]src[\\/]app[\\/]/ },
];

for (const rule of boundaryRules) {
  for (const file of filesIn(join(root, rule.directory)).filter((path) => /\.[cm]?[jt]sx?$/.test(path))) {
    if (rule.ignore?.test(file)) continue;
    const imports = readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => /^\s*(?:import|export)\b/.test(line))
      .join('\n');
    if (rule.forbidden.test(imports)) {
      violations.push(`${rule.name} boundary violated by ${relative(root, file)}.`);
    }
  }
}

if (violations.length) {
  console.error('Architecture validation failed:\n' + violations.map((message) => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('Architecture validation passed.');
