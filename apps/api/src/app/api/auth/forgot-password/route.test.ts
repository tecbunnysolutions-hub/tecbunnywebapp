import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  profile: null as null | Record<string, unknown>,
  lookups: [] as Array<[string, unknown]>,
  generateOTP: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: (column: string, value: unknown) => {
          mocks.lookups.push([column, value]);
          return { maybeSingle: async () => ({ data: mocks.profile, error: null }) };
        },
      }),
    }),
    auth: { admin: { getUserById: mocks.getUserById } },
  }),
}));
vi.mock('@tecbunny/core', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  normalizeRole: (value: unknown) => (typeof value === 'string' ? value : null),
}));
vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: async () => ({ allowed: true }) }));
vi.mock('@tecbunny/core/captcha/captcha-service', () => ({ verifyCaptcha: async () => ({ success: true }) }));
vi.mock('@tecbunny/core/otp-manager', () => ({
  OTPManager: class {
    generateOTP = mocks.generateOTP;
  },
}));

import { POST } from './route';

const request = (body: Record<string, unknown>) => new NextRequest('https://api.test/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify(body),
});

describe('forgot-password delivery binding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lookups = [];
    mocks.profile = { id: 'victim-id', email: 'victim@example.com', mobile: '919000000001', role: 'customer' };
    mocks.getUserById.mockResolvedValue({ data: { user: { id: 'victim-id' } }, error: null });
    mocks.generateOTP.mockResolvedValue({ success: true, otpId: 'otp-1', channel: 'whatsapp' });
  });

  it('delivers only to the contact stored on the matched account', async () => {
    const response = await POST(request({ email: 'victim@example.com', mobile: '918888888888', channel: 'whatsapp' }));
    expect(response.status).toBe(200);
    expect(mocks.lookups).toEqual([['email', 'victim@example.com']]);
    expect(mocks.generateOTP).toHaveBeenCalledWith(expect.objectContaining({
      email: 'victim@example.com',
      phone: '919000000001',
      userId: 'victim-id',
      preferredChannel: 'whatsapp',
      purpose: 'password_reset',
    }));
  });

  it('limits staff accounts to their registered email', async () => {
    mocks.profile = { ...mocks.profile, role: 'admin' };
    await POST(request({ email: 'victim@example.com', channel: 'whatsapp' }));
    expect(mocks.generateOTP).toHaveBeenCalledWith(expect.objectContaining({ preferredChannel: 'email', userId: 'victim-id' }));
  });

  it('returns the generic response without sending for unknown accounts', async () => {
    mocks.profile = null;
    const response = await POST(request({ email: 'nobody@example.com' }));
    expect(response.status).toBe(200);
    expect(mocks.generateOTP).not.toHaveBeenCalled();
  });
});
