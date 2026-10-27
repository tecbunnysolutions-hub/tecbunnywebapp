import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), root: vi.fn() }));
vi.mock('@tecbunny/database/server', () => ({ createServerClient: async () => ({ auth: { getUser: mocks.getUser, getSession: mocks.getSession } }) }));
vi.mock('@tecbunny/database/admin', () => ({ isSupabaseServiceConfigured: false, createServiceClient: vi.fn() }));
vi.mock('../logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('./superadmin-session', () => ({ verifySuperadminSessionToken: mocks.root }));
import { getSessionWithRole } from './server-role';

describe('role sessions for dashboard API checks', () => {
  const user = { id: 'demo-admin', app_metadata: { role: 'admin' }, user_metadata: { role: 'superadmin' } };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.root.mockResolvedValue(null);
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });
    mocks.getSession.mockResolvedValue({ data: { session: null } });
  });
  it('uses a verified bearer identity without requiring or reading a cookie session', async () => {
    const result = await getSessionWithRole(new NextRequest('https://test/api/admin/profile', { headers: { Authorization: 'Bearer demo-token' } }));
    expect(mocks.getUser).toHaveBeenCalledWith('demo-token');
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(result.session?.user).toEqual(user);
    expect(result.session?.access_token).toBe('demo-token');
    expect(result.role).toBe('admin');
  });
  it('rejects an invalid bearer instead of falling back to a cookie identity', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid token' } });
    mocks.getSession.mockResolvedValue({ data: { session: { user, access_token: 'cookie-token' } } });
    const result = await getSessionWithRole(new NextRequest('https://test/api/admin/profile', { headers: { Authorization: 'Bearer invalid' } }));
    expect(result.session).toBeNull();
    expect(result.role).toBeNull();
    expect(mocks.getSession).not.toHaveBeenCalled();
  });
  it('retains cookie sessions using the identity verified by the auth server', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'stale-user' }, access_token: 'cookie-token' } } });
    const result = await getSessionWithRole(new NextRequest('https://test/api/admin/profile'));
    expect(mocks.getUser).toHaveBeenCalledWith(undefined);
    expect(result.session?.access_token).toBe('cookie-token');
    expect(result.session?.user).toEqual(user);
  });
});
