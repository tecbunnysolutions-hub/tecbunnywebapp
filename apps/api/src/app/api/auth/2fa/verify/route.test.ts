import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const verifyTwoFactor = vi.fn();
const rateLimit = vi.fn();

vi.mock('@tecbunny/database/server', () => ({
  createSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) } }),
}));
vi.mock('@tecbunny/core/two-factor-manager', () => ({ twoFactorManager: { verifyTwoFactor: (...a: unknown[]) => verifyTwoFactor(...a) } }));
vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: (...a: unknown[]) => rateLimit(...a) }));

import { POST } from './route';

const req = () => new NextRequest('http://localhost/api/auth/2fa/verify', {
  method: 'POST',
  headers: { 'x-forwarded-for': '1.2.3.4' },
  body: JSON.stringify({ code: '123456' }),
});

describe('POST /api/auth/2fa/verify rate limiting', () => {
  beforeEach(() => {
    verifyTwoFactor.mockReset();
    rateLimit.mockReset();
    rateLimit.mockResolvedValue({ allowed: true });
  });

  it('returns 429 when the IP limit is exceeded', async () => {
    rateLimit.mockResolvedValue({ allowed: false });
    const res = await POST(req());
    expect(res.status).toBe(429);
    expect(verifyTwoFactor).not.toHaveBeenCalled();
  });

  it('returns 429 when the per-user limit is exceeded', async () => {
    verifyTwoFactor.mockResolvedValue({ success: false, message: 'Too many', rateLimited: true });
    const res = await POST(req());
    expect(res.status).toBe(429);
  });

  it('returns 200 on success', async () => {
    verifyTwoFactor.mockResolvedValue({ success: true, message: 'ok' });
    const res = await POST(req());
    expect(res.status).toBe(200);
  });
});
