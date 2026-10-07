import { AdminOrdersSchema, type AdminOrders, type AdminOrdersQuery } from '@tecbunny/contracts';

import type { ApiClient } from './client';

export function adminApi(client: ApiClient) {
  return {
    /** Staff: orders list. Requires `getToken`; never cached. */
    async orders(query: Partial<AdminOrdersQuery> = {}, opts: { signal?: AbortSignal } = {}): Promise<AdminOrders> {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) if (value !== undefined) params.set(key, String(value));
      const qs = params.toString();
      const data = await client.request(`/api/v1/admin/orders${qs ? `?${qs}` : ''}`, { schema: AdminOrdersSchema, signal: opts.signal, cache: 'no-store' });
      return data ?? { orders: [], total: 0 };
    },
  };
}
