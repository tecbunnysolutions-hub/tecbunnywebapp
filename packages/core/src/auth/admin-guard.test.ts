import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), assurance: vi.fn(), profile: vi.fn(), verifyRoot: vi.fn() }));
vi.mock('..', () => ({ ALL_ROLES: ['admin', 'customer', 'superadmin'], normalizeRole: (role: unknown) => role, logger: { warn: vi.fn() } }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }), headers: async () => new Headers() }));
vi.mock('./superadmin-session', () => ({ verifySuperadminSessionToken: mocks.verifyRoot }));
vi.mock('@tecbunny/database/admin', () => ({
  isSupabaseServiceConfigured: true,
  createSupabaseServiceClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: mocks.profile }) }) }) }),
}));
vi.mock('@tecbunny/database/server', () => ({
  createSupabaseClient: async () => ({ auth: { getUser: mocks.getUser, mfa: { getAuthenticatorAssuranceLevel: mocks.assurance } } }),
}));
import { requireAdminContext } from './admin-guard';

describe('Admin guard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.verifyRoot.mockResolvedValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } }, error: null });
    mocks.profile.mockResolvedValue({ data: { role: 'admin' }, error: null });
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(requireAdminContext()).rejects.toMatchObject({ status: 401, message: 'Authentication required' });
  });

  it('allows an admin with verified admin role', async () => {
    await expect(requireAdminContext()).resolves.toMatchObject({ role: 'admin', user: { id: 'admin-1' } });
  });

  it('does not grant admin access to a customer', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'customer-1', app_metadata: { role: 'customer' } } }, error: null });
    mocks.profile.mockResolvedValue({ data: { role: 'customer' }, error: null });
    await expect(requireAdminContext()).rejects.toMatchObject({ status: 403, message: 'Insufficient permissions' });
  });

  it('allows superadmin when valid superadmin session exists', async () => {
    mocks.verifyRoot.mockResolvedValue({ email: 'super@tecbunny.com', role: 'superadmin' });
    await expect(requireAdminContext()).resolves.toMatchObject({ role: 'superadmin', user: { email: 'super@tecbunny.com' } });
  });
});
