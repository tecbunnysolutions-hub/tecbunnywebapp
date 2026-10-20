import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashSuperadminPassword } from '@tecbunny/core/auth/superadmin-password';

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn() }));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { POST } from './route';

const PASSWORD = 'Correct-Horse-9!';
let hash = '';

const login = (body: unknown) =>
  POST(new Request('https://waba.test/api/auth/login', {
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

describe('POST /api/auth/login in apps/waba (superadmin credential path)', () => {
  it('authenticates a superadmin and sets the session cookie', async () => {
    const res = await login({ email: ' Root-Admin ', password: PASSWORD, isSuperadmin: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('superadmin-session=');
  });

  it('rejects a wrong password or id', async () => {
    expect((await login({ email: 'root-admin', password: 'Wrong-Password-1!', isSuperadmin: true })).status).toBe(401);
    expect((await login({ email: 'someone', password: PASSWORD, isSuperadmin: true })).status).toBe(401);
  });

  it('rejects the staff flow and invalid payloads', async () => {
    expect((await login({ email: 'root-admin', password: PASSWORD })).status).toBe(400);
    expect((await login({ email: 'root-admin', password: 'short' })).status).toBe(400);
  });

  it('rejects when no hash is configured in production', async () => {
    vi.stubEnv('SUPERADMIN_PASSWORD_HASH', '');
    expect((await login({ email: 'root-admin', password: PASSWORD, isSuperadmin: true })).status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false });
    expect((await login({ email: 'root-admin', password: PASSWORD, isSuperadmin: true })).status).toBe(429);
  });
});
