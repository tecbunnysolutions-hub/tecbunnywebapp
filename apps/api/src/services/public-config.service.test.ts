import { describe, expect, it } from 'vitest';

import { DEFAULT_PUBLIC_CONFIG, PublicConfigSchema } from '@tecbunny/contracts';

import { buildPublicConfig, type PublicConfigSources } from './public-config.service';

const SECRET_KEY = /secret|token|password|service_?role|private_?key/i;

const collectKeys = (value: unknown, out: string[] = []): string[] => {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      out.push(key);
      collectKeys(child, out);
    }
  }
  return out;
};

const sources = (env: Record<string, string | undefined>): PublicConfigSources => ({
  env,
  flags: async () => ({ blogEnabled: true }),
  setting: async (_key, fallback) => fallback,
  gstPercent: async () => 18,
  support: async () => ({ email: 'a@b.c', phone: '1', whatsappLink: 'https://wa.me/1' }),
});

describe('public config allowlist', () => {
  it('declares no secret-looking keys in the schema defaults', () => {
    expect(collectKeys(DEFAULT_PUBLIC_CONFIG).filter((k) => SECRET_KEY.test(k))).toEqual([]);
  });

  it('declares no secret-looking keys in the schema shape', () => {
    const names: string[] = [];
    const walk = (shape: Record<string, any>) => {
      for (const [key, node] of Object.entries(shape)) {
        names.push(key);
        const inner = node?.shape ?? node?._def?.shape;
        if (inner) walk(inner);
      }
    };
    walk(PublicConfigSchema.shape);
    expect(names.filter((k) => SECRET_KEY.test(k))).toEqual([]);
  });

  it('never leaks secret env values and rejects unknown keys', async () => {
    const config = await buildPublicConfig(
      sources({
        SUPABASE_SECRET_KEY: 'sb-secret-value',
        SUPABASE_SERVICE_ROLE_KEY: 'role-value',
        TURNSTILE_SECRET_KEY: 'ts-secret-value',
        INTERNAL_API_TOKEN: 'internal-value',
        NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-public',
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      }),
    );
    const json = JSON.stringify(config);
    for (const leaked of ['sb-secret-value', 'role-value', 'ts-secret-value', 'internal-value']) {
      expect(json).not.toContain(leaked);
    }
    expect(config.supabase).toEqual({ url: 'https://x.supabase.co', anonKey: 'anon-public' });
    expect(config.turnstileSiteKey).toBe('site-key');
    expect(PublicConfigSchema.safeParse({ ...config, apiSecret: 'x' }).success).toBe(false);
  });

  it('serves GST and discount defaults and clamps invalid values', async () => {
    const config = await buildPublicConfig({ ...sources({}), gstPercent: async () => 500 });
    expect(config.pricing.gstRatePercent).toBe(18);
    expect(config.pricing.customSetupDiscountPercent).toBe(12);
  });
});
