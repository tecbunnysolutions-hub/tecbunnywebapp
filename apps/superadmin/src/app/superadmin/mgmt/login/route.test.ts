import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashSuperadminPassword, verifySuperadminPassword } from '@tecbunny/core/auth/superadmin-password';
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from '@tecbunny/core/auth/superadmin-session';

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn() }));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/server', () => ({
  rateLimit: mocks.rateLimit,
  verifyCaptcha: async () => ({ success: true }),
  verifySuperadminPassword,
  createSuperadminSessionToken,
  SUPERADMIN_SESSION_TTL_SECONDS,
}));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { POST } from './route';

const PASSWORD = 'Correct-Horse-9!';
let hash = '';

const login = (body: unknown) =>
  POST(new Request('https://superadmin.test/superadmin/mgmt/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.9' },
    body: JSON.stringify(body),
  }));

beforeAll(async () => {
  hash = await hashSuperadminPassword(PASSWORD);
});

beforeEach(() => {
  mocks.rateLimit.mockResolvedValue({ allowed: true });
  vi.stubEnv('SUPERADMIN_USER_ID', 'root-admin');
  vi.stubEnv('SUPERADMIN_PASSWORD_HASH', hash);
  vi.stubEnv('SUPERADMIN_SESSION_SECRET', 'test-session-secret-0123456789abcdef');
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('POST /superadmin/mgmt/login (superadmin credential path)', () => {
  it('authenticates and sets both session cookies', async () => {
    const res = await login({ userId: 'root-admin', password: PASSWORD });
    const cookies = res.headers.get('set-cookie') ?? '';
    expect(res.status).toBe(200);
    expect(cookies).toContain('superadmin-session=');
    expect(cookies).toContain('tb-superadmin-active=true');
  });

  it('matches the user id case-insensitively and accepts the email field', async () => {
    expect((await login({ email: 'ROOT-ADMIN', password: PASSWORD })).status).toBe(200);
  });

  it('rejects a wrong password or id', async () => {
    expect((await login({ userId: 'root-admin', password: 'Wrong-Password-1!' })).status).toBe(401);
    expect((await login({ userId: 'someone', password: PASSWORD })).status).toBe(401);
  });

  it('returns 500 when credentials are not configured', async () => {
    vi.stubEnv('SUPERADMIN_PASSWORD_HASH', '');
    expect((await login({ userId: 'root-admin', password: PASSWORD })).status).toBe(500);
  });

  it('returns 429 when rate limited', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false });
    expect((await login({ userId: 'root-admin', password: PASSWORD })).status).toBe(429);
  });
});
