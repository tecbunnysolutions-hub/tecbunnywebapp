import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashSuperadminPassword, verifySuperadminPassword } from '@tecbunny/core/auth/superadmin-password';
import { createSuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn() }));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/server', async () => ({
  getTrustedClientIp: () => '203.0.113.9',
  rateLimit: mocks.rateLimit,
  verifySuperadminPassword,
  createSuperadminSessionToken,
}));

import { POST } from './route';

const PASSWORD = 'Correct-Horse-9!';
let hash = '';

const login = (body: unknown) =>
  POST(new Request('https://api.test/api/admin-auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

describe('POST /api/admin-auth/login (superadmin credential path)', () => {
  it('authenticates with the correct id and password and sets the session cookie', async () => {
    const res = await login({ userId: 'root-admin', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('superadmin-session=');
  });

  it('rejects a wrong password', async () => {
    const res = await login({ userId: 'root-admin', password: 'Wrong-Password-1!' });
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('rejects a wrong user id (case-sensitive)', async () => {
    expect((await login({ userId: 'ROOT-ADMIN', password: PASSWORD })).status).toBe(401);
    expect((await login({ userId: 'someone', password: PASSWORD })).status).toBe(401);
  });

  it('rejects invalid payloads', async () => {
    expect((await login({ userId: 'root-admin', password: 'short' })).status).toBe(400);
  });

  it('returns 503 when credentials are not configured', async () => {
    vi.stubEnv('SUPERADMIN_PASSWORD_HASH', '');
    expect((await login({ userId: 'root-admin', password: PASSWORD })).status).toBe(503);
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false });
    expect((await login({ userId: 'root-admin', password: PASSWORD })).status).toBe(429);
  });
});
