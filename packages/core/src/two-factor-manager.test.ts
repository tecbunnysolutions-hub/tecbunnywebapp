import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@tecbunny/core', () => ({ logger: { error: vi.fn() } }));
vi.mock('@tecbunny/database/admin', () => ({ isSupabaseServiceConfigured: false, createServiceClient: vi.fn() }));
import { twoFactorManager } from './two-factor-manager';

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
