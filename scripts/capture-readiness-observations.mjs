import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// A bounded read-only smoke sweep, never a production load or business-write test.
const checks = [
  ['api-health', 'https://api.tecbunny.com/api/health', 200],
  ['blog', 'https://api.tecbunny.com/api/v1/blog', 200],
  ['services', 'https://api.tecbunny.com/api/v1/services', 200],
  ['blueprints', 'https://api.tecbunny.com/api/v1/blueprints', 200],
  ['anonymous-admin-quotes', 'https://api.tecbunny.com/api/admin/quotes', 401],
  ['anonymous-admin-archive', 'https://api.tecbunny.com/api/admin/products/archive', 401],
  ['anonymous-audit-logs', 'https://api.tecbunny.com/api/security/audit-logs', 401],
  ['storefront', 'https://www.tecbunny.com/', 200],
  ['staff-login', 'https://staff.tecbunny.com/auth/login', 200],
];
const report = { recordedAt: new Date().toISOString(), scope: 'nine sequential anonymous GETs; no provider sends, customer writes or load test', results: [] };
for (const [name, url, expected] of checks) {
  const start = performance.now();
  try {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15_000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const result = { name, url, expectedStatus: expected, status: response.status,
      durationMs: Math.round(performance.now() - start), pass: response.status === expected,
      headers: Object.fromEntries(['cache-control', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy']
        .map(header => [header, response.headers.get(header)])) };
    if (name === 'api-health') {
      const health = JSON.parse(bytes.toString());
      result.reportedHealth = health.status;
      result.privateDetailsAbsent = !('features' in health) && !('message' in health)
        && Array.isArray(health.checks) && health.checks.every(item => !('details' in item) && ['OK', 'Degraded', 'Unavailable'].includes(item.message));
      result.pass &&= health.status === 'healthy' && result.privateDetailsAbsent && /no-store/i.test(result.headers['cache-control'] ?? '');
    }
    if (name === 'blueprints') {
      const payload = JSON.parse(bytes.toString());
      result.publicProjectionRestricted = Array.isArray(payload.data?.blueprints)
        && payload.data.blueprints.every(item => Object.keys(item).every(key => ['id', 'updated_at'].includes(key)));
      result.pass &&= result.publicProjectionRestricted;
    }
    report.results.push(result);
  } catch {
    report.results.push({ name, url, expectedStatus: expected, status: null, pass: false, error: 'transport, redirect or response-validation failure; body not logged' });
  }
}
report.status = report.results.every(result => result.pass) ? 'pass' : 'fail';
const output = path.resolve('scratch/readiness-observations'); mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'pass') process.exitCode = 1;
