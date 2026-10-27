import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ verify: vi.fn(), signIn: vi.fn() }));
vi.mock('@tecbunny/core/auth/superadmin-session', () => ({ verifySuperadminSessionToken: mocks.verify }));
vi.mock('@tecbunny/database', () => ({ requireSupabasePublicEnv: () => ({ url: 'https://example.supabase.co', publicKey: 'public' }) }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { signInWithPassword: mocks.signIn } }) }));
import { POST } from './route';

const request = () => new NextRequest('https://api.example.com/dashboard/demo-session', { method: 'POST', headers: { cookie: 'superadmin-session=valid' } });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.verify.mockResolvedValue({ sub: 'admin' });
  vi.stubEnv('API_HEALTH_DEMO_EMAIL', 'demo@example.com');
  vi.stubEnv('API_HEALTH_DEMO_PASSWORD', 'demo-password');
});
afterEach(() => vi.unstubAllEnvs());

describe('automatic dashboard demo authentication', () => {
  it('rejects requests without a verified superadmin session', async () => {
    mocks.verify.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it('allows the dashboard to reuse its session when demo credentials are absent', async () => {
    vi.stubEnv('API_HEALTH_DEMO_EMAIL', '');
    vi.stubEnv('API_HEALTH_DEMO_PASSWORD', '');
    expect(await (await POST(request())).json()).toEqual({ configured: false });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it('reports incomplete demo configuration', async () => {
    vi.stubEnv('API_HEALTH_DEMO_PASSWORD', '');
    expect((await POST(request())).status).toBe(503);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it('uses server credentials without returning the password or refresh token', async () => {
    mocks.signIn.mockResolvedValue({ data: { session: { access_token: 'access', refresh_token: 'secret-refresh' }, user: { app_metadata: { role: 'customer' } } }, error: null });
    const response = await POST(request());
    expect(mocks.signIn).toHaveBeenCalledWith({ email: 'demo@example.com', password: 'demo-password' });
    expect(await response.json()).toEqual({ configured: true, token: 'access', role: 'customer' });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('reports an invalid configured account without leaking provider errors', async () => {
    mocks.signIn.mockResolvedValue({ data: {}, error: { message: 'private provider detail' } });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private provider detail');
  });
});
