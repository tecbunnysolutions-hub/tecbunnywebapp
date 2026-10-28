import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ session: vi.fn(), rpc: vi.fn(), from: vi.fn(), service: vi.fn() }));
vi.mock('@tecbunny/core/auth/server-role', () => ({ getSessionWithRole: mocks.session }));
vi.mock('@tecbunny/database/admin', () => ({ isSupabaseServiceConfigured: true, createServiceClient: mocks.service }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../../../lib/revalidate-public', () => ({ withPublicRevalidation: (_tags: string[], handler: unknown) => handler }));
import { POST, PUT, DELETE, GET } from './route';

const id = '00000000-0000-4000-8000-000000000001';
async function invoke(route: typeof POST, input: NextRequest) {
  const response = await route(input, { params: Promise.resolve({}) });
  if (!response) throw new Error('Route did not return a response');
  return response;
}
const request = (method: string, body?: object, query = '') => new NextRequest(`https://api.test/api/admin/products/archive${query}`, {
  method, ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ session: { user: { id: 'superadmin-root-id' } }, role: 'superadmin' });
  mocks.service.mockReturnValue({ rpc: mocks.rpc, from: mocks.from });
});

describe('audited product archival', () => {
  it.each([POST, PUT, DELETE, GET])('rejects unauthenticated callers before creating a privileged client', async handler => {
    mocks.session.mockResolvedValue({ session: null, role: null });
    expect((await invoke(handler, request('GET'))).status).toBe(401);
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it.each(['admin', 'manager', 'customer'])('rejects %s callers before accessing the database', async role => {
    mocks.session.mockResolvedValue({ session: { user: { id } }, role });
    expect((await invoke(POST, request('POST', { id }))).status).toBe(403);
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it('passes the verified actor to the atomic archive operation', async () => {
    mocks.rpc.mockResolvedValue({ data: { id, changed: true, is_deleted: true }, error: null });
    const response = await invoke(POST, request('POST', { id, reason: 'Retired', p_actor_id: 'spoofed' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.rpc).toHaveBeenCalledWith('archive_product_atomic', { p_product_id: id, p_actor_id: 'superadmin-root-id', p_reason: 'Retired' });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([
    ['POST', POST, { id }, ''], ['PUT', PUT, { id }, ''], ['DELETE', DELETE, undefined, `?id=${id}`],
  ] as const)('fails closed when the %s RPC is missing or fails', async (method, handler, body, query) => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'private schema detail' } });
    const response = await invoke(handler, request(method, body, query));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private schema detail');
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('restores through the audited operation and passes no caller-controlled actor', async () => {
    mocks.rpc.mockResolvedValue({ data: { id, changed: true, is_deleted: false, status: 'inactive' }, error: null });
    expect((await invoke(PUT, request('PUT', { id }))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('restore_product_atomic', { p_product_id: id, p_actor_id: 'superadmin-root-id' });
  });
  it('accepts uppercase UUIDs while checking the canonical database result', async () => {
    const uppercase = 'ABCDEF00-1234-4000-8000-000000000001';
    mocks.rpc.mockResolvedValue({ data: { id: uppercase.toLowerCase(), changed: true, is_deleted: true }, error: null });
    expect((await invoke(POST, request('POST', { id: uppercase }))).status).toBe(200);
    expect(mocks.rpc.mock.calls[0][1].p_product_id).toBe(uppercase.toLowerCase());
  });
  it('returns a conflict for a legacy archive without verified history', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: '23514' } });
    expect((await invoke(PUT, request('PUT', { id }))).status).toBe(409);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('does not report success for the old void-returning function contract', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    expect((await invoke(POST, request('POST', { id }))).status).toBe(503);
  });
  it.each(['?id=invalid', `?id=${id}&reason=${'x'.repeat(501)}`])('validates DELETE query parameters', async query => {
    expect((await invoke(DELETE, request('DELETE', undefined, query))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each(['?page=abc', '?limit=-1', '?limit=201'])('rejects invalid pagination', async query => {
    expect((await invoke(GET, request('GET', undefined, query))).status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
