import { MeOverviewSchema, type MeOverview } from '@tecbunny/contracts';

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
  };
}
