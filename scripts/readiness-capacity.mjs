import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setMaxListeners } from 'node:events';

const productionProject = 'yzrznydkqcacjiwalmlw';
export function validateTarget(config, proof, selfTest = false) {
  const target = new URL(config.baseUrl);
  assert.ok(target.protocol === 'http:' && target.hostname === '127.0.0.1' && target.port && !['3000', '3001'].includes(target.port), 'Only an explicitly isolated loopback port or SSH tunnel is allowed');
  assert.ok(target.pathname === '/' && !target.username && !target.password && !target.search && !target.hash, 'Invalid target origin');
  assert.equal(proof.baseUrl, target.origin);
  assert.ok(typeof proof.drillId === 'string' && /^[a-f0-9-]{36}$/.test(proof.drillId), 'Missing staging identity marker');
  if (!selfTest) {
    assert.equal(proof.environment, 'isolated-staging');
    assert.ok(/^[a-z]{20}$/.test(proof.supabaseProjectRef) && proof.supabaseProjectRef !== productionProject, 'Production or unknown database project');
    assert.equal(proof.productionDatabaseAbsent, true);
    assert.equal(proof.outboundProviders, 'local-sinks-only');
    assert.ok(/^sha256:[a-f0-9]{64}$/.test(proof.imageDigest), 'Missing immutable image identity');
    assert.ok(/^[a-f0-9]{40}$/.test(proof.sourceRevision), 'Missing source identity');
    const age = Date.now() - Date.parse(proof.checkedAt);
    assert.ok(age >= 0 && age < 3_600_000, 'Recheck staging isolation within one hour of the run');
    assert.ok(config.durationSeconds >= 300 && config.durationSeconds <= 900, 'Use a bounded 5–15 minute soak');
    assert.ok(config.rampSeconds >= 30 && config.rampSeconds <= 120);
  }
  assert.equal(config.users, 100, 'This drill must exercise the requested 100 users');
  assert.ok(config.thinkMs >= 0 && config.thinkMs <= 10_000);
  assert.ok(config.scenarios?.length > 0);
  assert.equal(new Set(config.scenarios.map(item => item.name)).size, config.scenarios.length, 'Scenario labels must be unique');
  let sum = 0;
  for (const scenario of config.scenarios) {
    assert.ok(typeof scenario.name === 'string' && /^[a-z0-9-]{1,60}$/.test(scenario.name), 'Use non-sensitive scenario labels');
    assert.ok(typeof scenario.path === 'string' && scenario.path.startsWith('/api/') && !scenario.path.includes('://') && !/[\r\n]/.test(scenario.path), 'Only relative API paths are allowed');
    assert.ok([...new URL(scenario.path, target).searchParams.keys()].every(key => !/^(token|key|secret|password|email|phone)$/i.test(key)), 'Private values must not appear in URLs');
    assert.ok(Number.isFinite(scenario.weight) && scenario.weight > 0);
    assert.ok(Array.isArray(scenario.expectedStatuses) && scenario.expectedStatuses.length > 0 && scenario.expectedStatuses.every(status => Number.isInteger(status) && status >= 200 && status <= 299), 'Only expected successful responses count toward capacity');
    sum += scenario.weight;
  }
  assert.equal(sum, 100, 'Scenario weights must sum to 100');
}

export async function runCapacity(config, proof, users = [], { selfTest = false } = {}) {
  validateTarget(config, proof, selfTest);
  if (config.scenarios.some(item => item.authenticated)) {
    assert.equal(users.length, 100, 'Provide 100 isolated synthetic user sessions');
    assert.ok(users.every(user => typeof user.accessToken === 'string' && user.accessToken.length >= 20));
    assert.equal(new Set(users.map(user => user.accessToken)).size, 100, 'Sessions must be distinct');
  }
  const stop = new AbortController();
  setMaxListeners(256, stop.signal);
  const request = async (scenario, user) => {
    const response = await fetch(new URL(scenario.path, config.baseUrl), {
      method: 'GET', redirect: 'error',
      headers: { Accept: 'application/json', ...(scenario.authenticated ? { Authorization: `Bearer ${user.accessToken}` } : {}) },
      signal: AbortSignal.any([stop.signal, AbortSignal.timeout(5000)]),
    });
    assert.equal(response.headers.get('x-tecbunny-drill-id'), proof.drillId, 'Target staging identity marker missing or changed');
    let bytes = 0;
    const chunks = [];
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const item = await reader.read(); if (item.done) break;
          bytes += item.value.byteLength;
          if (bytes > 128 * 1024) { await reader.cancel(); throw new Error('Response exceeds the bounded drill size'); }
          chunks.push(item.value);
        }
      } finally { reader.releaseLock(); }
    }
    const cache = response.headers.get('cache-control') ?? '';
    const json = /application\/json/i.test(response.headers.get('content-type') ?? '');
    if (json && scenario.expectedStatuses.includes(response.status)) JSON.parse(Buffer.concat(chunks).toString());
    return { status: response.status, expected: json && scenario.expectedStatuses.includes(response.status)
      && (!scenario.authenticated || (/private/i.test(cache) && /no-store/i.test(cache))) };
  };
  // Misconfigured targets fail before starting 100 users. Never follow redirects.
  for (const scenario of config.scenarios) {
    const outcome = await request(scenario, users[0]);
    assert.equal(outcome.expected, true, `Preflight failed: ${scenario.name}`);
  }
  const metrics = new Map(config.scenarios.map(item => [item.name, { requests: 0, unexpected: 0, latencies: [], statuses: {} }]));
  const startedAt = new Date().toISOString();
  const start = performance.now(), soakStart = start + config.rampSeconds * 1000;
  const finish = soakStart + config.durationSeconds * 1000;
  let activeUsers = 0, peakUsers = 0, inFlight = 0, peakInFlight = 0, requests = 0, unexpected = 0, stoppedReason = null;
  const recentErrors = [];
  const pause = ms => new Promise(resolve => {
    if (stop.signal.aborted || ms <= 0) { resolve(); return; }
    const done = () => { clearTimeout(timer); stop.signal.removeEventListener('abort', done); resolve(); };
    const timer = setTimeout(done, ms); stop.signal.addEventListener('abort', done, { once: true });
  });
  const choose = () => {
    let value = Math.random() * 100;
    for (const item of config.scenarios) { value -= item.weight; if (value < 0) return item; }
    return config.scenarios.at(-1);
  };
  const worker = async index => {
    await pause(config.rampSeconds * 1000 * index / config.users);
    if (stop.signal.aborted) return;
    activeUsers++; peakUsers = Math.max(peakUsers, activeUsers);
    try {
      while (!stop.signal.aborted && performance.now() < finish) {
        const scenario = choose(), began = performance.now(), soak = began >= soakStart;
        inFlight++; peakInFlight = Math.max(peakInFlight, inFlight);
        let outcome;
        try { outcome = await request(scenario, users[index]); }
        catch { outcome = { status: 'request-failed', expected: false }; }
        finally { inFlight--; }
        requests++; if (!outcome.expected) unexpected++;
        recentErrors.push(outcome.expected ? 0 : 1); if (recentErrors.length > 50) recentErrors.shift();
        if (soak) {
          const metric = metrics.get(scenario.name);
          metric.requests++; metric.unexpected += outcome.expected ? 0 : 1;
          metric.latencies.push(performance.now() - began);
          metric.statuses[outcome.status] = (metric.statuses[outcome.status] ?? 0) + 1;
        }
        if (requests >= 100_000 || (recentErrors.length === 50 && recentErrors.reduce((sum, value) => sum + value, 0) / 50 > 0.05)) {
          stoppedReason = requests >= 100_000 ? 'request budget exceeded' : 'unexpected errors exceeded 5% stop threshold';
          stop.abort(); break;
        }
        await pause(config.thinkMs * (0.5 + Math.random()));
      }
    } finally { activeUsers--; }
  };
  const interrupt = () => { stoppedReason = 'operator interrupted'; stop.abort(); };
  process.once('SIGINT', interrupt);
  try { await Promise.all(Array.from({ length: config.users }, (_, index) => worker(index))); }
  finally { process.removeListener('SIGINT', interrupt); }
  const scenarios = Object.fromEntries([...metrics].map(([name, metric]) => {
    metric.latencies.sort((a, b) => a - b);
    return [name, { requests: metric.requests, unexpected: metric.unexpected, statuses: metric.statuses,
      p95Ms: metric.latencies.length ? Math.round(metric.latencies[Math.ceil(metric.latencies.length * 0.95) - 1]) : null }];
  }));
  const samples = Object.values(scenarios), total = samples.reduce((sum, metric) => sum + metric.requests, 0);
  const failures = samples.reduce((sum, metric) => sum + metric.unexpected, 0);
  const passed = !stoppedReason && peakUsers === 100 && total > 0 && failures / total < 0.01
    && samples.every(metric => metric.requests >= (selfTest ? 1 : 20) && metric.p95Ms < 2000);
  return { type: selfTest ? 'runner-self-test' : 'staging-read-capacity', status: passed ? 'pass' : 'fail',
    startedAt, finishedAt: new Date().toISOString(), sourceRevision: proof.sourceRevision ?? null, imageDigest: proof.imageDigest ?? null,
    configuredUsers: config.users, peakActiveUsers: peakUsers, peakInFlightRequests: peakInFlight,
    rampSeconds: config.rampSeconds, configuredSoakSeconds: config.durationSeconds,
    observedDurationMs: Math.round(performance.now() - start), totalRequestsIncludingRamp: requests, unexpectedIncludingRamp: unexpected,
    soakRequests: total, soakUnexpected: failures, soakUnexpectedRate: total ? failures / total : null,
    stoppedReason, scenarios, thresholds: { unexpectedRateBelow: 0.01, perScenarioP95MsBelow: 2000 },
    scenarioMix: config.scenarios.map(({ name, weight, authenticated }) => ({ name, weight, authenticated: Boolean(authenticated) })),
    limitations: selfTest ? ['Tests the load runner against an isolated fixture server; not application or VPS capacity evidence']
      : ['Read-heavy API mix only; excludes provider sends, real checkout/settlement and frontend rendering',
        'Interpret alongside recorded staging hardware/database class, isolation proof and saturation observations'] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(process.argv.length, 4, 'Usage: node scripts/readiness-capacity.mjs <private-config.json> <fresh-isolation-proof.json>');
    const configPath = path.resolve(process.argv[2]);
    const config = JSON.parse(readFileSync(configPath));
    const proof = JSON.parse(readFileSync(path.resolve(process.argv[3])));
    const users = config.sessionsFile ? JSON.parse(readFileSync(path.resolve(path.dirname(configPath), config.sessionsFile))) : [];
    const report = await runCapacity(config, proof, users);
    const output = path.resolve('scratch/readiness-capacity'); mkdirSync(output, { recursive: true });
    writeFileSync(path.join(output, `report-${Date.now()}.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2)); if (report.status !== 'pass') process.exitCode = 1;
  } catch (error) { console.error(`Capacity drill refused or failed: ${error.message}`); process.exitCode = 1; }
}
