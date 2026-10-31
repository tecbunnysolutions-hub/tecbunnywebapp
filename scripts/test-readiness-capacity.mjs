import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { runCapacity, validateTarget } from './readiness-capacity.mjs';

const config = { baseUrl: 'http://127.0.0.1:13301', users: 100, rampSeconds: 0, durationSeconds: 0.6, thinkMs: 5,
  scenarios: [{ name: 'fixture', path: '/api/fixture', weight: 100, expectedStatuses: [200] }] };
const proof = { baseUrl: config.baseUrl, drillId: randomUUID() };
test('production, normal app ports and invalid isolation evidence are refused before load', () => {
  for (const baseUrl of ['https://api.tecbunny.com', 'http://127.0.0.1:3001', 'http://localhost:13301', 'http://127.0.0.1:3000']) {
    assert.throws(() => validateTarget({ ...config, baseUrl }, { ...proof, baseUrl }, true));
  }
  assert.throws(() => validateTarget(config, { ...proof, environment: 'isolated-staging', supabaseProjectRef: 'yzrznydkqcacjiwalmlw' }));
  assert.throws(() => validateTarget(config, proof));
});
test('sensitive URLs and denial statuses cannot count as passing capacity', () => {
  for (const scenario of [
    { ...config.scenarios[0], path: '/api/fixture?token=private' },
    { ...config.scenarios[0], expectedStatuses: [401] },
    { ...config.scenarios[0], expectedStatuses: [429] },
  ]) assert.throws(() => validateTarget({ ...config, scenarios: [scenario] }, proof, true));
});
async function fixture(handler, action) {
  const server = createServer((req, res) => { res.setHeader('content-type', 'application/json'); handler(req, res); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try { await action({ ...structuredClone(config), baseUrl }, { ...proof, baseUrl }); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test('runner really starts 100 users; fixture results are explicitly not capacity proof', async () => {
  await fixture((req, res) => { res.setHeader('x-tecbunny-drill-id', proof.drillId); res.end('{"ok":true}'); }, async (target, identity) => {
    const result = await runCapacity(target, identity, [], { selfTest: true });
    assert.equal(result.status, 'pass'); assert.equal(result.peakActiveUsers, 100);
    assert.equal(result.type, 'runner-self-test'); assert.ok(result.soakRequests >= 100);
    assert.ok(result.peakInFlightRequests > 1);
  });
});
test('missing identity marker fails preflight', async () => {
  await fixture((req, res) => res.end('{}'), async (target, identity) => {
    await assert.rejects(runCapacity(target, identity, [], { selfTest: true }), /identity marker/);
  });
});
test('authenticated scenarios use distinct sessions and require private no-store responses', async () => {
  const users = Array.from({ length: 100 }, (_, index) => ({ accessToken: `synthetic-fixture-session-${index}-not-a-real-secret` }));
  const seen = new Set();
  await fixture((req, res) => {
    seen.add(req.headers.authorization);
    res.setHeader('x-tecbunny-drill-id', proof.drillId);
    res.setHeader('cache-control', 'private, no-store'); res.end('{}');
  }, async (target, identity) => {
    target.scenarios[0] = { ...target.scenarios[0], authenticated: true };
    const result = await runCapacity(target, identity, users, { selfTest: true });
    assert.equal(result.status, 'pass'); assert.equal(seen.size, 100);
  });
  await fixture((req, res) => { res.setHeader('x-tecbunny-drill-id', proof.drillId); res.end('{}'); }, async (target, identity) => {
    target.scenarios[0] = { ...target.scenarios[0], authenticated: true };
    await assert.rejects(runCapacity(target, identity, users, { selfTest: true }), /Preflight/);
  });
});
test('429 responses stop the drill and remain unexpected errors', async () => {
  let count = 0;
  await fixture((req, res) => { res.setHeader('x-tecbunny-drill-id', proof.drillId); res.statusCode = ++count === 1 ? 200 : 429; res.end('{}'); }, async (target, identity) => {
    const result = await runCapacity(target, identity, [], { selfTest: true });
    assert.equal(result.status, 'fail'); assert.match(result.stoppedReason, /5%/); assert.ok(result.soakUnexpected > 0);
  });
});
test('HTTP redirects are refused rather than following a target outside the drill', async () => {
  await fixture((req, res) => { res.writeHead(302, { Location: 'https://api.tecbunny.com/api/health' }); res.end(); }, async (target, identity) => {
    await assert.rejects(runCapacity(target, identity, [], { selfTest: true }));
  });
});
