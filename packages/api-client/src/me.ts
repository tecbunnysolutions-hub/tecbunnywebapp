import { MeOverviewSchema, MeOrderSchema, MeProfileSchema, type MeOrder, type MeOverview, type MeProfile } from '@tecbunny/contracts';

import type { ApiClient } from './client';

export function meApi(client: ApiClient) {
  return {
    /** Authenticated: requires `getToken` on the client. Never cached. */
    async overview(opts: { signal?: AbortSignal } = {}): Promise<MeOverview> {
      const data = await client.request('/api/v1/me/overview', {
        schema: MeOverviewSchema,
        signal: opts.signal,
        cache: 'no-store',
      });
      if (!data) throw new Error('Empty profile response');
      return data;
    },
  
    /** Authenticated: the caller's own profile row. Never cached. */
    async profile(opts: { signal?: AbortSignal } = {}): Promise<MeProfile> {
      const data = await client.request('/api/v1/me/profile', { schema: MeProfileSchema, signal: opts.signal, cache: 'no-store' });
      return data ?? { profile: null };
    },
  
    /** Authenticated: one of the caller's own orders (404 -> null). */
    async order(orderId: string, opts: { signal?: AbortSignal } = {}): Promise<MeOrder | null> {
      return client.request(`/api/v1/me/orders/${encodeURIComponent(orderId)}`, { schema: MeOrderSchema, signal: opts.signal, nullOnStatus: [404], cache: 'no-store' });
    },
  };
}
