import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(), serviceClient: vi.fn(), requireAdmin: vi.fn(), root: vi.fn(),
  userFrom: vi.fn(), serviceFrom: vi.fn(),
}));
vi.mock('@tecbunny/database/server', () => ({ createSupabaseClient: mocks.createClient }));
vi.mock('@tecbunny/database/admin', () => ({ createServiceClient: mocks.serviceClient }));
vi.mock('@tecbunny/core/admin-auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@tecbunny/core/permissions', () => ({ isSuperadminSession: mocks.root }));
vi.mock('@tecbunny/core/quotes/action-token', () => ({ createQuoteActionToken: () => 'test-token' }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
import { GET } from './route';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }, from: mocks.userFrom });
  mocks.serviceClient.mockReturnValue({ from: mocks.serviceFrom });
  mocks.requireAdmin.mockResolvedValue({ isAdmin: true });
  mocks.root.mockResolvedValue(false);
});
const request = () => new NextRequest('https://api.test/api/admin/quotes');
const query = (result: object) => ({ select: () => ({ order: () => Promise.resolve(result) }) });

describe('admin quote query authorization', () => {
  it('does not create a privileged client for an unauthorized caller', async () => {
    mocks.requireAdmin.mockResolvedValue({ isAdmin: false });
    expect((await GET(request())).status).toBe(401);
    expect(mocks.serviceClient).not.toHaveBeenCalled();
    expect(mocks.userFrom).not.toHaveBeenCalled();
  });
  it('uses the service client only after verifying the root session', async () => {
    mocks.root.mockResolvedValue(true);
    mocks.serviceFrom.mockReturnValue(query({ data: [{ id: 'quote-1' }], error: null }));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.serviceFrom).toHaveBeenCalledWith('quotes');
    expect(mocks.userFrom).not.toHaveBeenCalled();
  });
  it('preserves RLS for an ordinary admin', async () => {
    mocks.userFrom.mockReturnValue(query({ data: [], error: null }));
    expect((await GET(request())).status).toBe(200);
    expect(mocks.serviceClient).not.toHaveBeenCalled();
  });
  it('does not expose database errors in the response', async () => {
    mocks.userFrom.mockReturnValue(query({ data: null, error: { message: 'private schema detail' } }));
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private schema detail');
  });
});
