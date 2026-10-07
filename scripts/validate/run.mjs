#!/usr/bin/env node
// Single entry point for the repo validators.
//   node scripts/validate/run.mjs <group...> [--list] [--keep-going]
// Groups: architecture, product-ux, runtime, launch, all. TypeScript checks loop over apps/* so
// adding an app needs no edits here.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const evidence = 'quality/runtime-readiness-evidence.json';

const script = (file, ...args) => ({ name: file.replace(/^validate-|\.mjs$/g, ''), cmd: process.execPath, args: [path.join('scripts', file), ...args] });

const appTypechecks = () =>
  fs
    .readdirSync(path.join(root, 'apps'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'apps', entry.name, 'tsconfig.json')))
    .map((entry) => ({
      name: `tsc:${entry.name}`,
      cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['tsc', '--noEmit', '--pretty', 'false', '-p', `apps/${entry.name}/tsconfig.json`],
    }));

const groups = {
  architecture: () => [script('validate-architecture.mjs'), script('validate-api-boundary.mjs')],
  'product-ux': () => [
    script('validate-enterprise-actions.mjs'),
    script('validate-no-browser-modals.mjs'),
    script('validate-accessibility-contract.mjs'),
    script('validate-product-telemetry.mjs'),
    script('validate-performance-budgets.mjs'),
    script('validate-visual-baselines.mjs'),
    script('validate-launch-evidence.mjs'),
    script('validate-theme-contract.mjs'),
    script('validate-launch-readiness.mjs'),
    script('validate-infra-observability.mjs'),
    ...appTypechecks(),
  ],
  runtime: () => [
    script('validate-runtime-readiness.mjs', evidence, '--mode=strict'),
    script('validate-runtime-evidence-artifacts.mjs', evidence),
    script('validate-runtime-evidence-completeness.mjs', evidence),
  ],
  launch: () => [script('validate-launch-evidence.mjs'), script('validate-launch-readiness.mjs')],
};
groups.all = () => ['architecture', 'product-ux', 'runtime'].flatMap((name) => groups[name]());

const args = process.argv.slice(2);
const keepGoing = args.includes('--keep-going');
const requested = args.filter((arg) => !arg.startsWith('--'));

if (args.includes('--list') || requested.length === 0) {
  console.log(`Usage: node scripts/validate/run.mjs <group...> [--keep-going]\nGroups: ${Object.keys(groups).join(', ')}`);
  process.exit(requested.length === 0 && !args.includes('--list') ? 1 : 0);
}

const unknown = requested.filter((name) => !groups[name]);
if (unknown.length) {
  console.error(`Unknown group(s): ${unknown.join(', ')}. Available: ${Object.keys(groups).join(', ')}`);
  process.exit(1);
}

const seen = new Set();
const steps = requested.flatMap((name) => groups[name]()).filter((step) => !seen.has(step.name) && seen.add(step.name));

const failures = [];
for (const step of steps) {
  console.log(`\n> ${step.name}`);
  const result = spawnSync(step.cmd, step.args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' && step.cmd.endsWith('.cmd') });
  if (result.status !== 0) {
    failures.push(step.name);
    if (!keepGoing) break;
  }
}

if (failures.length) {
  console.error(`\nValidation failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`\nValidation passed (${steps.length} steps).`);
