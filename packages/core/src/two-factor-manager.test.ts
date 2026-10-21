import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@tecbunny/core', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('@tecbunny/database/admin', () => ({ isSupabaseServiceConfigured: false, createServiceClient: vi.fn() }));
const rateLimitMock = vi.fn();
vi.mock('./rate-limit', () => ({ rateLimit: (...args: unknown[]) => rateLimitMock(...args) }));
import { twoFactorManager } from './two-factor-manager';

describe('verifyTwoFactor hardening', () => {
  beforeEach(() => {
    vi.stubEnv('TOTP_SECRET_ENCRYPTION_KEY', 'a'.repeat(64));
    rateLimitMock.mockReset();
    rateLimitMock.mockResolvedValue({ allowed: true });
  });
  afterEach(() => vi.unstubAllEnvs());

  const makeClient = (row: Record<string, unknown>, rowsUpdated: number) => {
    const calls: Array<[string, unknown]> = [];
    const query: any = {
      select: (cols: string) => { if (cols === 'id') return Promise.resolve({ data: Array.from({ length: rowsUpdated }, () => ({ id: 'u1' })), error: null }); return query; },
      eq: (c: string, v: unknown) => { calls.push([c, v]); return query; },
      single: async () => ({ data: row, error: null }),
      update: () => query,
    };
    return { client: { from: () => query } as unknown as SupabaseClient, calls };
  };
  const row = { two_factor_secret: 'JBSWY3DPEHPK3PXP', two_factor_backup_codes: ['AAAABBBB'], two_factor_backup_codes_used: [] };

  it('rejects when rate limited without touching the DB', async () => {
    rateLimitMock.mockResolvedValue({ allowed: false });
    const { client } = makeClient(row, 1);
    const result = await twoFactorManager.verifyTwoFactor('u1', '000000', client);
    expect(result).toMatchObject({ success: false, rateLimited: true });
    expect(rateLimitMock).toHaveBeenCalledWith('2fa:verify:u1', 5, 15 * 60 * 1000);
  });

  it('consumes a backup code with compare-and-swap on the previous value', async () => {
    const { client, calls } = makeClient(row, 1);
    const result = await twoFactorManager.verifyTwoFactor('u1', 'AAAA-BBBB', client);
    expect(result).toMatchObject({ success: true, backupCodeUsed: true });
    expect(calls).toContainEqual(['two_factor_backup_codes_used', []]);
  });

  it('fails when a concurrent request already consumed the backup code', async () => {
    const { client } = makeClient(row, 0);
    const result = await twoFactorManager.verifyTwoFactor('u1', 'AAAA-BBBB', client);
    expect(result.success).toBe(false);
    expect(result.backupCodeUsed).toBeUndefined();
  });
});

describe('Atomic 2FA enrollment', () => {
  beforeEach(() => vi.stubEnv('TOTP_SECRET_ENCRYPTION_KEY', 'a'.repeat(64)));
  afterEach(() => vi.unstubAllEnvs());

  it('does not overwrite a factor activated by a concurrent request', async () => {
    const row = { id: 'user-1', two_factor_enabled: false, two_factor_secret: '' };
    const client = {
      from: () => {
        let payload: Record<string, unknown> = {};
        let disabledOnly = false;
        const query = {
          update: (value: Record<string, unknown>) => { payload = value; return query; },
          eq: () => query,
          or: (condition: string) => { disabledOnly = condition === 'two_factor_enabled.is.null,two_factor_enabled.eq.false'; return query; },
          select: () => query,
          maybeSingle: async () => {
            if (disabledOnly && row.two_factor_enabled) return { data: null, error: null };
            Object.assign(row, payload);
            return { data: { id: row.id }, error: null };
          },
        };
        return query;
      },
    } as unknown as SupabaseClient;
    const results = await Promise.all([
      twoFactorManager.enableTwoFactor(row.id, 'FIRSTSECRET', ['AAAA-BBBB'], client),
      twoFactorManager.enableTwoFactor(row.id, 'SECONDSECRET', ['CCCC-DDDD'], client),
    ]);
    expect(results).toEqual([true, false]);
    expect(row.two_factor_enabled).toBe(true);
    expect(row.two_factor_secret).toMatch(/^enc:v1:/);
  });
});
