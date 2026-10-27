import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ verify: vi.fn(), revoke: vi.fn(), signOut: vi.fn(), createClient: vi.fn() }));
vi.mock('@tecbunny/core/server', () => ({ revokeSuperadminSessionToken: m.revoke, verifySuperadminSessionToken: m.verify }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { warn: vi.fn() } }));
vi.mock('@tecbunny/database', () => ({ requireSupabasePublicEnv: () => ({ url: 'https://test.supabase.co', publicKey: 'public' }) }));
vi.mock('@supabase/ssr', () => ({ createServerClient: m.createClient }));
import { POST } from './route';

function request(cookie = '', origin = 'https://api.tecbunny.com') {
  return new NextRequest('https://api.tecbunny.com/api/admin-auth/logout', { method: 'POST', headers: { cookie, origin } });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  m.revoke.mockResolvedValue(undefined);
  m.verify.mockResolvedValue({ sub: 'root' });
  m.signOut.mockResolvedValue({ error: null });
  m.createClient.mockReturnValue({ auth: { signOut: m.signOut } });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('dashboard logout', () => {
  it('revokes the root and local SSO sessions and clears host/domain cookie chunks', async () => {
    const response = await POST(request('superadmin-session=v2.payload.signature; sb-demo-auth-token.0=one; sb-demo-auth-token.1=two'));
    expect(response.status).toBe(200);
    expect(m.revoke).toHaveBeenCalledWith('v2.payload.signature');
    expect(m.signOut).toHaveBeenCalledWith({ scope: 'local' });
    const cookies = response.headers.getSetCookie();
    for (const name of ['superadmin-session', 'tb-superadmin-active', 'sb-demo-auth-token.0', 'sb-demo-auth-token.1']) {
      expect(cookies.some(cookie => cookie.startsWith(`${name}=`) && !cookie.includes('Domain='))).toBe(true);
      expect(cookies.some(cookie => cookie.startsWith(`${name}=`) && cookie.includes('Domain=.tecbunny.com'))).toBe(true);
    }
    expect(cookies.every(cookie => cookie.toLowerCase().includes('max-age=0'))).toBe(true);
    expect(response.headers.get('clear-site-data')).toContain('storage');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('also succeeds with no session or malformed cookies', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(m.createClient).not.toHaveBeenCalled();
    expect((await POST(request('superadmin-session=%broken'))).status).toBe(200);
  });
  it('uses the public host behind Caddy rather than Next’s internal hostname', async () => {
    const response = await POST(new NextRequest('https://0.0.0.0:3001/api/admin-auth/logout', {
      method: 'POST', headers: { host: 'api.tecbunny.com', 'x-forwarded-proto': 'https', origin: 'https://api.tecbunny.com' },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('Domain=.tecbunny.com');
  });
  it('does not clear sessions on a cross-origin logout request', async () => {
    const response = await POST(request('superadmin-session=token', 'https://other.example'));
    expect(response.status).toBe(403);
    expect(m.revoke).not.toHaveBeenCalled();
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });
  it('clears invalid or expired cookies without writing attacker-supplied revocations', async () => {
    m.verify.mockResolvedValue(null);
    const response = await POST(request('superadmin-session=forged-token'));
    expect(response.status).toBe(200);
    expect(m.revoke).not.toHaveBeenCalled();
  });
  it('clears the browser session even when upstream revocation fails', async () => {
    m.revoke.mockRejectedValue(new Error('Redis unavailable'));
    m.signOut.mockResolvedValue({ error: new Error('Auth unavailable') });
    const response = await POST(request('superadmin-session=token; sb-demo-auth-token=session'));
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
  it('bounds stalled revocation so the browser can still sign out', async () => {
    vi.useFakeTimers();
    m.revoke.mockReturnValue(new Promise(() => {}));
    const pending = POST(request('superadmin-session=token'));
    await vi.advanceTimersByTimeAsync(5000);
    expect((await pending).status).toBe(200);
  });
});
