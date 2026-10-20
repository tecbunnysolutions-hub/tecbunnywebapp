import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashSuperadminPassword, verifySuperadminPassword } from '@tecbunny/core/auth/superadmin-password';
import { createSuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn() }));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/server', () => ({ verifySuperadminPassword, createSuperadminSessionToken, rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { NextRequest } from 'next/server';
import { POST } from './route';

const PASSWORD = 'Correct-Horse-9!';
let hash = '';

const login = (email: string, password: string) =>
  POST(new NextRequest('https://superadmin.test/api/auth/extension', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));

beforeAll(async () => {
  hash = await hashSuperadminPassword(PASSWORD);
});

beforeEach(() => {
  mocks.rateLimit.mockResolvedValue({ allowed: true });
  vi.stubEnv('SUPERADMIN_USER_ID', 'root-admin');
  vi.stubEnv('SUPERADMIN_EMAIL', 'root@example.test');
  vi.stubEnv('SUPERADMIN_PASSWORD_HASH', hash);
  vi.stubEnv('SUPERADMIN_SESSION_SECRET', 'test-session-secret-0123456789abcdef');
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('POST /api/auth/extension in apps/superadmin', () => {
  it('issues a token for the user id or the email', async () => {
    const byId = await login('root-admin', PASSWORD);
    expect(byId.status).toBe(200);
    expect((await byId.json()).user.role).toBe('superadmin');
    expect((await login('Root@Example.test', PASSWORD)).status).toBe(200);
  });

  it('rejects a wrong password or an unknown identifier with 401', async () => {
    expect((await login('root-admin', 'Wrong-Password-1!')).status).toBe(401);
    expect((await login('someone@example.test', PASSWORD)).status).toBe(401);
  });

  it('requires both fields', async () => {
    expect((await login('', PASSWORD)).status).toBe(400);
  });

  it('returns 503 when the hash is not configured', async () => {
    vi.stubEnv('SUPERADMIN_PASSWORD_HASH', '');
    expect((await login('root-admin', PASSWORD)).status).toBe(503);
  });
});
