import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Source verification and commit status only. This never publishes API artifacts,
// connects to the VPS, promotes Vercel releases, or executes database migrations.
const root = fileURLToPath(new URL('..', import.meta.url));
const publish = process.argv.includes('--publish-status');
assert.ok(process.argv.slice(2).every(arg => arg === '--publish-status'), 'Unknown gate argument');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const npmCli = process.env.npm_execpath;
assert.ok(npmCli && existsSync(npmCli) && path.basename(npmCli) === 'npm-cli.js', 'Run through npm run release:check:local');
assert.equal(git(['status', '--porcelain']), '', 'Use a clean isolated checkout at the reviewed commit');
for (const directory of [root, ...['apps', 'packages'].flatMap(group => readdirSync(path.join(root, group), { withFileTypes: true })
  .filter(item => item.isDirectory()).map(item => path.join(root, group, item.name)))]) {
  for (const name of readdirSync(directory)) {
    assert.ok(!name.startsWith('.env') || name.endsWith('.example'), 'Private/local env file present; use a credential-free checkout');
  }
}
const revision = git(['rev-parse', 'HEAD']);
const output = path.join(root, 'scratch/local-gate', `${revision.slice(0, 12)}-${Date.now()}`);
mkdirSync(output, { recursive: true });
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', TURBO_TELEMETRY_DISABLED: '1' };
for (const name of Object.keys(env)) {
  if (/(SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE_KEY|SUPABASE|DATABASE_URL|DIRECT_URL|SMTP_|PAYU_|INFOBIP_|TURNSTILE|CASHFREE_|SENTRY_|TURBO_TEAM)/i.test(name)) delete env[name];
}
Object.assign(env, {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:9',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-source-check-only-not-a-secret',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_source_check_only',
  DATABASE_URL: 'postgresql://fixture:fixture@127.0.0.1:9/fixture?connect_timeout=1',
  DIRECT_URL: 'postgresql://fixture:fixture@127.0.0.1:9/fixture?connect_timeout=1',
});
const report = {
  revision, tree: git(['rev-parse', 'HEAD^{tree}']), startedAt: new Date().toISOString(),
  sourceLockSha256: createHash('sha256').update(readFileSync(path.join(root, 'package-lock.json'))).digest('hex'),
  node: process.version, npm: execFileSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8' }).trim(),
  platform: `${process.platform}-${process.arch}`, environment: 'isolated source checks; nonfunctional compile fixtures',
  deployableArtifact: false, checks: [], status: 'pending',
};
const repo = 'tecbunnysolutions-hub/tecbunnywebapp';
function status(state, description) {
  if (!publish) return;
  const remote = git(['remote', 'get-url', 'origin']);
  assert.ok(remote === `https://github.com/${repo}.git` || remote === `https://github.com/${repo}` || remote === `git@github.com:${repo}.git`, 'Unexpected status destination');
  const result = spawnSync('gh', ['api', `repos/${repo}/statuses/${revision}`, '--method', 'POST',
    '-f', `state=${state}`, '-f', 'context=Local release gate', '-f', `description=${description}`], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(result.status, 0, 'Could not record source gate status; no API deployment was attempted');
}
const checks = [
  ['install', [npmCli, 'ci', '--no-fund', '--no-audit']],
  ['backport', [npmCli, 'run', 'test:security-backport']],
  ['dependency-policy', [npmCli, 'run', 'audit:dependencies']],
  ['audit-policy-regressions', ['--test', 'scripts/test-dependency-audit-policy.mjs']],
  ['capacity-runner-regressions', ['--test', 'scripts/test-readiness-capacity.mjs']],
  ['monitor-regressions', ['scripts/test-ops-health-monitor.py'], process.platform === 'win32' ? 'python' : 'python3'],
  ['scheduled-backup-regressions', ['ops/test-scheduled-db-backup.py'], process.platform === 'win32' ? 'python' : 'python3'],
  ['architecture', [npmCli, 'run', 'validate:architecture']],
  ['api-boundary', [npmCli, 'run', 'validate:api-boundary']],
  ['typecheck', [npmCli, 'run', 'typecheck', '--', '--concurrency=1']],
  ['lint', [npmCli, 'run', 'lint', '--', '--concurrency=1']],
  ['tests', [npmCli, 'run', 'test', '--', '--concurrency=1']],
  ['security-migrations', [npmCli, 'run', 'test:security-migrations']],
  ['local-recovery-regression', ['scripts/drill-local-recovery.mjs']],
  ['product-gates', [npmCli, 'run', 'validate:product-ux']],
  ['database-readiness', [npmCli, 'run', 'validate:db-readiness']],
  ['observability-contract', [npmCli, 'run', 'validate:infra-observability']],
  ['runtime-readiness', [npmCli, 'run', 'validate:runtime-readiness']],
  ['runtime-artifacts', [npmCli, 'run', 'validate:runtime-evidence-artifacts']],
  ['runtime-completeness', [npmCli, 'run', 'validate:runtime-evidence-completeness']],
  ['fixture-build', ['scripts/build-ci.mjs']],
];
try {
  status('pending', 'Local source and strict readiness checks running');
  for (const [name, args, executable = process.execPath] of checks) {
    const start = performance.now();
    console.log(`Running ${name}; output saved locally`);
    const result = spawnSync(executable, args, { cwd: root, env, encoding: 'utf8', timeout: 45 * 60_000, maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(path.join(output, `${name}.log`), (result.stdout ?? '') + (result.stderr ?? ''));
    report.checks.push({ name, command: [executable === process.execPath ? 'node' : executable, ...args.map(arg => arg === npmCli ? '<npm-cli>' : arg)],
      exitCode: result.status, status: result.status === 0 && !result.error ? 'pass' : 'fail',
      durationMs: Math.round(performance.now() - start), errorCode: result.error?.code ?? null });
    console.log(`${name}: ${report.checks.at(-1).status}`);
    if (report.checks.at(-1).status !== 'pass') break;
  }
  assert.equal(git(['rev-parse', 'HEAD']), revision, 'Commit changed during checks');
  assert.equal(git(['status', '--porcelain']), '', 'Tracked source changed during checks');
  report.status = report.checks.length === checks.length && report.checks.every(check => check.status === 'pass') ? 'pass' : 'fail';
  report.notRun = checks.slice(report.checks.length).map(([name]) => name);
  status(report.status === 'pass' ? 'success' : 'failure', report.status === 'pass' ? 'Local source and strict readiness gates passed' : 'Local source or strict readiness gates failed');
} catch (error) {
  report.status = 'fail'; report.error = error.message;
  try { status('failure', 'Local release gate did not complete successfully'); } catch { /* saved in local receipt */ }
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, revision, receipt: path.relative(root, path.join(output, 'receipt.json')), deployableArtifact: false }, null, 2));
  if (report.status !== 'pass') process.exitCode = 1;
}
