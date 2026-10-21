import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  profile: { id: 'user-1' } as { id: string } | null,
  allowed: true,
  generateOTP: vi.fn(async () => ({ success: true, otpId: 'otp-1', channel: 'email', fallbackAvailable: false, message: 'sent' })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => {
      const node: any = { select: () => node, eq: () => node, maybeSingle: async () => ({ data: state.profile, error: null }) };
      return node;
    },
    auth: { admin: { getUserById: async () => ({ data: { user: { id: 'user-1' } }, error: null }) } },
  }),
}));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/captcha/captcha-service', () => ({ verifyCaptcha: async () => ({ success: true }) }));
vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: async () => ({ allowed: state.allowed }) }));
vi.mock('@tecbunny/core/otp-manager', () => ({ OTPManager: class { generateOTP = state.generateOTP; } }));

import { POST } from './route';

const post = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('forgot-password flow (user-facing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.profile = { id: 'user-1' };
    state.allowed = true;
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
  });

  it('issues a password_reset OTP without calling the internal-only /api/email/password-reset route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await POST(post({ email: 'Person@Example.com' }));
    expect(res.status).toBe(200);
    expect(state.generateOTP).toHaveBeenCalledWith(expect.objectContaining({ purpose: 'password_reset', preferredChannel: 'email' }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(res.headers.get('set-cookie')).toContain('recovery_otp=');
  });

  it('answers generically and sends nothing for an unknown account', async () => {
    state.profile = null;
    const res = await POST(post({ email: 'nobody@example.com' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(state.generateOTP).not.toHaveBeenCalled();
  });

  it('rate limits repeated requests', async () => {
    state.allowed = false;
    const res = await POST(post({ email: 'person@example.com' }));
    expect(res.status).toBe(429);
    expect(state.generateOTP).not.toHaveBeenCalled();
  });
});
