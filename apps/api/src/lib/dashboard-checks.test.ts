import { describe, expect, it } from 'vitest';
import { classify, isLiveAction, parseConfig, preparation, reportCsv, reportRows, requestPath, responseFailed, responseShape, type ApiRow } from './dashboard-checks';

const row: ApiRow = { path: '/api/products', method: 'GET', group: 'products', access: 'protected', dynamic: false };

describe('dashboard request checks', () => {
  it('allows authenticated reads and requires both permissions for live actions', () => {
    expect(preparation(row, {}, false)).toBeNull();
    for (const action of [{ ...row, method: 'DELETE' }, { ...row, path: '/api/cron/abandoned-carts' }, { ...row, path: '/api/shipping/update' }]) {
      expect(isLiveAction(action)).toBe(true);
      expect(preparation(action, {}, true)).toContain('Live action');
      expect(preparation(action, { allowSideEffects: true }, false)).toContain('Live action');
      expect(preparation(action, { allowSideEffects: true }, true)).toBeNull();
    }
  });

  it('resolves demo parameters and query strings without leaving the API path', () => {
    const dynamic = { ...row, path: '/api/products/[id]', dynamic: true };
    expect(preparation(dynamic, {}, false)).toContain('params.id');
    expect(requestPath(dynamic, { params: { id: 'demo 1' }, query: { q: 'a&b' } })).toBe('/api/products/demo%201?q=a%26b');
    for (const id of ['..', '.', '../orders', 'https://evil.example', 'x?delete=true', 'x\\y']) {
      expect(() => requestPath(dynamic, { params: { id } })).toThrow();
    }
    expect(requestPath({ ...row, path: '/api/trpc/[...path]' }, { params: { path: 'one/two' } })).toBe('/api/trpc/one/two');
    expect(requestPath({ ...row, path: '/api/docs/[[...path]]' }, {})).toBe('/api/docs');
  });

  it('validates request settings and rejects bodies on GET', () => {
    for (const text of ['null', '[]', '{"headers":{"x-key":12}}', '{"expectedStatus":99}', '{"allowSideEffects":"true"}']) {
      expect(() => parseConfig(text)).toThrow();
    }
    expect(preparation(row, { body: {} }, false)).toContain('cannot have a body');
    expect(parseConfig('{"body":{"name":"Demo"},"expectedStatus":201}').expectedStatus).toBe(201);
  });

  it('does not label missing auth, invalid input or unhealthy JSON as a pass', () => {
    expect(classify(200)).toBe('passed');
    expect(classify(401)).toBe('auth_required');
    expect(classify(403)).toBe('auth_required');
    expect(classify(422)).toBe('needs_input');
    for (const status of [0, 302, 404, 429, 500]) expect(classify(status)).toBe('failed');
    expect(classify(403, 403)).toBe('passed');
    expect(classify(200, 403)).toBe('failed');
    expect(responseFailed('{"ok":false}')).toBe(true);
    expect(responseFailed('{"status":"degraded"}')).toBe(true);
    expect(responseFailed('{"data":[]}')).toBe(false);
  });

  it('exports every endpoint, escapes CSV and omits response values and settings', () => {
    const all = reportRows([row, { ...row, method: 'POST' }], { 'GET /api/products': { state: 'passed', detail: '=HYPERLINK("bad")', checkedAt: '2026-10-26T10:00:00Z', status: 200 } });
    expect(all).toHaveLength(2);
    expect(all[1].state).toBe('not_checked');
    const csv = reportCsv(all);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('""bad""');
    const shape = responseShape('{"password":"secret123","customer":"private name"}');
    expect(shape).toContain('password');
    expect(shape).not.toContain('secret123');
    expect(shape).not.toContain('private name');
    expect(responseShape('private HTML')).toBe('Non-JSON response');
  });
});
