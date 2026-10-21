import { DEFAULT_PUBLIC_CONFIG, PublicConfigSchema, type PublicConfig } from '@tecbunny/contracts';

import type { ApiClient } from './client';

const TTL_MS = 60_000;

export function configApi(client: ApiClient, now: () => number = Date.now) {
  let cached: { value: PublicConfig; expiresAt: number } | null = null;

  return {
    /** Browser-safe config. Cached for 60s; falls back to the last value, then to safe defaults. */
    async getPublic(opts: { signal?: AbortSignal; force?: boolean } = {}): Promise<PublicConfig> {
      if (!opts.force && cached && cached.expiresAt > now()) return cached.value;
      try {
        const data = await client.request('/api/v1/config/public', {
          schema: PublicConfigSchema,
          signal: opts.signal,
          next: { revalidate: 60, tags: ['public-config'] },
        });
        if (data) {
          cached = { value: data, expiresAt: now() + TTL_MS };
          return data;
        }
      } catch {
        // fall through to stale or default values
      }
      return cached?.value ?? DEFAULT_PUBLIC_CONFIG;
    },
  };
}
