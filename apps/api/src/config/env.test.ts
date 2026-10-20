import { describe, expect, it, vi } from 'vitest';

import { EnvValidationError, loadEnv, normalizeEnv } from './env';

const base = { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SECRET_KEY: 'k' };

describe('api env', () => {
  it('accepts canonical names', () => {
    expect(loadEnv(base, () => {}).SUPABASE_SECRET_KEY).toBe('k');
  });

  it('falls back to deprecated aliases and warns with the NAME only', () => {
    const warn = vi.fn();
    const env = loadEnv(
      { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'legacy-secret-value' },
      warn,
    );
    expect(env.SUPABASE_SECRET_KEY).toBe('legacy-secret-value');
    expect(warn).toHaveBeenCalledWith('[env] SUPABASE_SERVICE_ROLE_KEY is deprecated; use SUPABASE_SECRET_KEY');
    expect(warn.mock.calls.flat().join(' ')).not.toContain('legacy-secret-value');
  });

  it('prefers the canonical name over an alias', () => {
    const out = normalizeEnv({ INTERNAL_API_TOKEN: 'new', INTERNAL_API_KEY: 'old' }, () => {});
    expect(out.INTERNAL_API_TOKEN).toBe('new');
  });

  it('maps every alias family', () => {
    const out = normalizeEnv(
      { WHATSAPP_VERIFY_TOKEN: 'a', WHATSAPP_TOKEN: 'b', PAYU_MODE: 'test', INTERNAL_API_KEY: 'c' },
      () => {},
    );
    expect(out).toMatchObject({
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'a',
      META_WHATSAPP_ACCESS_TOKEN: 'b',
      PAYU_ENVIRONMENT: 'test',
      INTERNAL_API_TOKEN: 'c',
    });
  });

  it('fails fast naming variables but not values', () => {
    try {
      loadEnv({ NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' }, () => {});
      throw new Error('expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).variables.sort()).toEqual(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY']);
      expect((error as Error).message).not.toContain('not-a-url');
    }
  });
});
