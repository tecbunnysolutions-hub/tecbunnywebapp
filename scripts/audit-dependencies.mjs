import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyBackport(packageRoot, manifest, mitigation, patch) {
  const sha = value => createHash('sha256').update(value).digest('hex');
  assert.equal(manifest.commit, mitigation.upstreamCommit, 'Unrecognized upstream commit');
  assert.equal(sha(JSON.stringify(manifest)), mitigation.manifestSha256, 'Unrecognized backport manifest');
  assert.equal(manifest.patchSha256, mitigation.patchSha256, 'Unrecognized patch');
  assert.equal(sha(patch), mitigation.patchSha256, 'Patch integrity failure');
  const installed = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(installed.name, mitigation.package);
  assert.equal(installed.version, mitigation.version, 'Unknown package version');
  assert.equal(manifest.version, mitigation.version);
  assert.equal(Object.keys(manifest.patchedSources ?? {}).length, 3, 'Incomplete source hashes');
  assert.equal(Object.keys(manifest.runtime ?? {}).length, 6, 'Incomplete runtime hashes');
  for (const [name, expected] of Object.entries({ ...manifest.patchedSources, ...manifest.runtime })) {
    assert.equal(sha(readFileSync(path.join(packageRoot, name))), expected, `Missing or changed backport: ${name}`);
  }
}

export function classifyAudit(audit, policy, now = Date.now()) {
  assert.equal(policy.version, 1, 'Unknown dependency audit policy');
  assert.equal(audit.auditReportVersion, 2, 'Unknown npm audit report format');
  assert.ok(!audit.error && audit.vulnerabilities && audit.metadata?.vulnerabilities, 'Incomplete audit report');
  const severe = Object.entries(audit.vulnerabilities).filter(([, finding]) => ['high', 'critical'].includes(finding.severity));
  assert.equal(severe.length, audit.metadata.vulnerabilities.high + audit.metadata.vulnerabilities.critical, 'Audit severity totals disagree');
  const known = [], blocked = [];
  for (const [name, finding] of severe) {
    const expected = policy.mitigation;
    const matches = name === expected.package && finding.severity === 'high' && finding.via?.length === 1
      && typeof finding.via[0] === 'object' && finding.via[0].url === expected.advisory
      && finding.via[0].name === expected.package && finding.via[0].severity === 'high'
      && Array.isArray(finding.nodes) && finding.nodes.length > 0;
    (matches ? known : blocked).push({ name, severity: finding.severity, nodes: finding.nodes ?? [], reason: matches ? 'requires verified installed backport' : 'unmitigated or unknown finding' });
  }
  if (known.length) {
    const approval = policy.approval;
    if (typeof approval?.owner !== 'string' || !approval.owner.trim() || typeof approval?.evidence !== 'string' || !approval.evidence.trim() || !Number.isFinite(Date.parse(approval.approvedAt)) || Date.parse(approval.approvedAt) > now) {
      blocked.push({ reason: 'Temporary mitigation policy has no explicit owner approval' });
    }
    if (!Number.isFinite(Date.parse(policy.expiresAt)) || now >= Date.parse(policy.expiresAt)) blocked.push({ reason: 'Temporary mitigation policy expired' });
  }
  return { known, blocked };
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const policy = JSON.parse(readFileSync(path.join(root, 'quality/dependency-audit-policy.json'), 'utf8'));
  const windows = process.platform === 'win32';
  const result = spawnSync(windows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm', windows ? ['/d', '/s', '/c', 'npm.cmd audit --json'] : ['audit', '--json'], {
    cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024,
  });
  assert.ok(!result.error && [0, 1].includes(result.status), 'npm audit did not complete; refusing release');
  const audit = JSON.parse(result.stdout);
  const classification = classifyAudit(audit, policy);
  const manifest = JSON.parse(readFileSync(path.join(root, policy.mitigation.manifest), 'utf8'));
  const patch = readFileSync(path.join(root, 'patches/zod/upstream-a0ebf97.patch'));
  const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const copies = new Set(classification.known.flatMap(item => item.nodes));
  for (const [name, pkg] of Object.entries(lock.packages)) {
    if (/(^|\/)node_modules\/zod$/.test(name) && pkg.version === policy.mitigation.version) copies.add(name);
  }
  const verification = [];
  for (const relative of copies) {
    assert.ok(/(^|\/)node_modules\/zod$/.test(relative) && !relative.includes('..') && !path.isAbsolute(relative), 'Unexpected affected package path');
    const packageRoot = realpathSync(path.join(root, relative));
    assert.ok(packageRoot.startsWith(realpathSync(root) + path.sep), 'Affected package escaped checkout');
    verifyBackport(packageRoot, manifest, policy.mitigation, patch);
    const regression = spawnSync(process.execPath, [path.join(root, 'scripts/test-zod-security-backport.mjs'), `--package-root=${packageRoot}`], { encoding: 'utf8', timeout: 60_000 });
    assert.equal(regression.status, 0, `Runtime regression failed for ${relative}`);
    verification.push({ packagePath: relative, sourceAndRuntimeHashes: 'pass', esmAndCommonJsRegression: 'pass' });
  }
  if (classification.known.length) assert.ok(verification.length, 'No affected installed package verified');
  const report = {
    recordedAt: new Date().toISOString(), status: classification.blocked.length ? 'fail' : 'pass',
    rawAuditExitCode: result.status, rawAudit: audit, policy, verification,
    classifications: classification,
    note: 'The raw finding is retained. This report does not authorize deployment or replace the existing raw-audit gate without approval.',
  };
  const output = path.join(root, 'scratch/dependency-audit');
  mkdirSync(output, { recursive: true });
  writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, rawAuditExitCode: result.status, rawSeverities: audit.metadata.vulnerabilities,
    verifiedCopies: verification.length, blocked: classification.blocked, report: 'scratch/dependency-audit/report.json' }, null, 2));
  if (classification.blocked.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Dependency audit policy failed closed: ${error.message}`); process.exitCode = 1; }
}
