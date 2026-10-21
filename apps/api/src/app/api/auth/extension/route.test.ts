import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashSuperadminPassword, verifySuperadminPassword } from '@tecbunny/core/auth/superadmin-password';

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock('@tecbunny/core/rate-limit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@tecbunny/core/server', () => ({
  verifySuperadminPassword,
  getTrustedClientIp: () => '203.0.113.9',
  rateLimit: mocks.rateLimit,
}));
vi.mock('@tecbunny/core/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/database/server', () => ({
  createSupabaseClient: async () => ({ auth: { signInWithPassword: mocks.signIn, signOut: vi.fn() }, from: vi.fn() }),
}));
vi.mock('../../extension-security', () => ({
  ExtensionAuthError: class extends Error { status = 403; },
  assertExtensionOrigin: () => undefined,
  extensionOptionsResponse: () => new Response(null, { status: 204 }),
  getExtensionCorsHeaders: () => ({}),
  extensionJson: (_req: unknown, body: unknown, init: ResponseInit = {}) => Response.json(body, init),
}));

import { NextRequest } from 'next/server';
import { POST } from './route';

const PASSWORD = 'Correct-Horse-9!';
let hash = '';

const login = (email: string, password: string) =>
  POST(new NextRequest('https://api.test/api/auth/extension', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));

beforeAll(async () => {
  hash = await hashSuperadminPassword(PASSWORD);
});

beforeEach(() => {
  mocks.rateLimit.mockResolvedValue({ allowed: true });
  mocks.signIn.mockResolvedValue({ data: { session: null, user: null }, error: { message: 'Invalid login' } });
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

describe('POST /api/auth/extension (superadmin credential path)', () => {
  it('issues a superadmin token for the configured user id', async () => {
    const res = await login('root-admin', PASSWORD);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.user.role).toBe('superadmin');
    expect(typeof json.access_token).toBe('string');
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('accepts the configured email, case-insensitively', async () => {
    expect((await login('ROOT@example.test', PASSWORD)).status).toBe(200);
  });

  it('rejects a wrong password for the superadmin id without falling through to Supabase', async () => {
    const res = await login('root-admin', 'Wrong-Password-1!');
    expect(res.status).toBe(401);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('falls through to Supabase for any other identifier', async () => {
    const res = await login('someone@example.test', PASSWORD);
    expect(res.status).toBe(401);
    expect(mocks.signIn).toHaveBeenCalledTimes(1);
  });
});
