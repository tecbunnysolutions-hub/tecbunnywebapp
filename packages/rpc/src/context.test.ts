import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getClaims: vi.fn() }));
vi.mock('@tecbunny/core/server', () => ({ verifySuperadminSessionToken: async () => null }));
vi.mock('@tecbunny/infra', () => ({ BaseSupabaseClient: class { rawClient = { auth: mocks }; } }));
import { createContext } from './context';

describe('RPC assurance claims', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-test-key');
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } }, error: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  const create = () => createContext({ req: new Request('https://api.test/api/trpc', { headers: { authorization: 'Bearer test-token' } }), resHeaders: new Headers(), info: {} as never });

  it('uses the verified assurance claim of the authenticated user', async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: 'admin-1', aal: 'aal2' } }, error: null });
    expect((await create()).mfaLevel).toBe('aal2');
    expect(mocks.getClaims).toHaveBeenCalledWith('test-token');
  });

  it.each([
    { data: { claims: { sub: 'another-user', aal: 'aal2' } }, error: null },
    { data: null, error: new Error('Invalid signature') },
  ])('does not trust invalid or mismatched claims', async (claims) => {
    mocks.getClaims.mockResolvedValue(claims);
    expect((await create()).mfaLevel).toBeNull();
  });
});
