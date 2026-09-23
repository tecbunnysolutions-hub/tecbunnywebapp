import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), assurance: vi.fn(), profile: vi.fn(), verifyRoot: vi.fn() }));
vi.mock('..', () => ({ ALL_ROLES: ['admin', 'customer', 'superadmin'], normalizeRole: (role: unknown) => role, logger: { warn: vi.fn() } }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock('./superadmin-session', () => ({ verifySuperadminSessionToken: mocks.verifyRoot }));
vi.mock('@tecbunny/database/admin', () => ({
  isSupabaseServiceConfigured: true,
  createSupabaseServiceClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: mocks.profile }) }) }) }),
}));
vi.mock('@tecbunny/database/server', () => ({
  createSupabaseClient: async () => ({ auth: { getUser: mocks.getUser, mfa: { getAuthenticatorAssuranceLevel: mocks.assurance } } }),
}));
import { requireAdminContext } from './admin-guard';

describe('Admin MFA guard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.verifyRoot.mockResolvedValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } }, error: null });
    mocks.profile.mockResolvedValue({ data: { role: 'admin' }, error: null });
  });

  it.each(['aal1', null])('rejects admin assurance %s', async (currentLevel) => {
    mocks.assurance.mockResolvedValue({ data: { currentLevel }, error: null });
    await expect(requireAdminContext()).rejects.toMatchObject({ status: 403, message: 'MFA Required' });
  });

  it('fails closed on assurance lookup failure', async () => {
    mocks.assurance.mockResolvedValue({ data: { currentLevel: 'aal2' }, error: new Error('Unavailable') });
    await expect(requireAdminContext()).rejects.toMatchObject({ status: 403 });
  });

  it('allows an admin with a verified second factor', async () => {
    mocks.assurance.mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null });
    await expect(requireAdminContext()).resolves.toMatchObject({ role: 'admin', user: { id: 'admin-1' } });
  });

  it('does not grant admin access to an MFA-authenticated customer', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'customer-1', app_metadata: { role: 'customer' } } }, error: null });
    mocks.assurance.mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null });
    await expect(requireAdminContext()).rejects.toMatchObject({ status: 403 });
  });
});
