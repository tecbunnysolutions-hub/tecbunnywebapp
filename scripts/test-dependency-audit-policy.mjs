import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyAudit, verifyBackport } from './audit-dependencies.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const policy = JSON.parse(readFileSync(path.join(root, 'quality/dependency-audit-policy.json')));
const approved = { ...policy, approval: { owner: 'fixture-only-owner', approvedAt: '2026-10-30T00:00:00Z', evidence: 'fixture-only-approval' } };
const now = Date.parse('2026-10-30T12:00:00Z');
const audit = {
  auditReportVersion: 2, metadata: { vulnerabilities: { high: 1, critical: 0 } },
  vulnerabilities: { zod: { severity: 'high', nodes: ['node_modules/zod'],
    via: [{ name: 'zod', severity: 'high', url: policy.mitigation.advisory }] } },
};
test('raw finding remains visible; approval and installed verification are distinct', () => {
  assert.equal(classifyAudit(audit, policy, now).blocked.length, 1);
  const result = classifyAudit(audit, approved, now);
  assert.equal(result.known.length, 1);
  assert.equal(result.blocked.length, 0);
  assert.equal(audit.metadata.vulnerabilities.high, 1);
});
test('new advisory or indirect vulnerability cannot use the backport classification', () => {
  for (const mutate of [
    value => { value.vulnerabilities.zod.via[0].url = 'https://github.com/advisories/GHSA-other'; },
    value => { value.vulnerabilities.zod.via.push('another-package'); },
    value => { value.vulnerabilities.zod.nodes = []; },
    value => { value.vulnerabilities.zod.via[0].severity = 'critical'; },
    value => { value.vulnerabilities.other = value.vulnerabilities.zod; delete value.vulnerabilities.zod; },
  ]) {
    const changed = structuredClone(audit); mutate(changed);
    assert.equal(classifyAudit(changed, approved, now).known.length, 0);
    assert.ok(classifyAudit(changed, approved, now).blocked.length);
  }
});
test('missing, malformed and inconsistent audit results fail closed', () => {
  for (const changed of [{}, { ...audit, auditReportVersion: 3 }, { ...audit, error: { code: 'NETWORK' } },
    { ...audit, metadata: { vulnerabilities: { high: 0, critical: 0 } } }]) {
    assert.throws(() => classifyAudit(changed, approved, now));
  }
});
test('expiry and future approval cannot admit a release', () => {
  assert.ok(classifyAudit(audit, approved, Date.parse(policy.expiresAt)).blocked.length);
  assert.ok(classifyAudit(audit, { ...approved, approval: { ...approved.approval, approvedAt: '2026-11-01T00:00:00Z' } }, now).blocked.length);
});
test('every pinned source and runtime byte is required, with package and patch provenance', () => {
  const manifest = JSON.parse(readFileSync(path.join(root, policy.mitigation.manifest)));
  const patch = readFileSync(path.join(root, 'patches/zod/upstream-a0ebf97.patch'));
  const temporary = mkdtempSync(path.join(tmpdir(), 'tecbunny-backport-policy-'));
  try {
    const names = ['package.json', ...Object.keys(manifest.patchedSources), ...Object.keys(manifest.runtime)];
    for (const name of names) {
      mkdirSync(path.dirname(path.join(temporary, name)), { recursive: true });
      copyFileSync(path.join(root, 'node_modules/zod', name), path.join(temporary, name));
    }
    const verify = () => verifyBackport(temporary, manifest, policy.mitigation, patch);
    verify();
    for (const name of names.filter(name => name !== 'package.json')) {
      const file = path.join(temporary, name), original = readFileSync(file);
      writeFileSync(file, Buffer.concat([original, Buffer.from('\n// tamper\n')]));
      assert.throws(verify, /Missing or changed backport/);
      writeFileSync(file, original);
    }
    writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({ name: 'zod', version: '4.6.6' }));
    assert.throws(verify, /Unknown package version/);
    assert.throws(() => verifyBackport(temporary, { ...manifest, commit: 'unreviewed' }, policy.mitigation, patch), /Unrecognized upstream commit/);
    assert.throws(() => verifyBackport(temporary, manifest, policy.mitigation, Buffer.from('changed')), /Patch integrity failure/);
  } finally {
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
    assert.ok(path.basename(temporary).startsWith('tecbunny-backport-policy-'));
    rmSync(temporary, { recursive: true, force: true });
  }
});
