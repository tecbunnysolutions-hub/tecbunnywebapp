import {
  AmcContractsSchema,
  type AmcContractQuery,
  type AmcContracts,
} from '@tecbunny/contracts';

import type { ApiClient } from './client';

export function amcContractsApi(client: ApiClient) {
  return {
    async list(query: Partial<AmcContractQuery> = {}, opts: { signal?: AbortSignal } = {}): Promise<AmcContracts> {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) params.set(key, String(value));
      }
      const search = params.toString();
      const data = await client.request(`/api/v1/admin/amc-contracts${search ? `?${search}` : ''}`, {
        schema: AmcContractsSchema,
        signal: opts.signal,
        cache: 'no-store',
      });
      return data ?? { contracts: [], counts: { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0 } };
    },
  };
}
