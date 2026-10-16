import { InvoiceDataSchema, type InvoiceData } from '@tecbunny/contracts';

import type { ApiClient } from './client';

export function invoicesApi(client: ApiClient) {
  return {
    async get(orderId: string, opts: { signal?: AbortSignal } = {}): Promise<InvoiceData | null> {
      return client.request(`/api/v1/invoices/${encodeURIComponent(orderId)}`, {
        schema: InvoiceDataSchema,
        signal: opts.signal,
        nullOnStatus: [404],
        cache: 'no-store',
      });
    },
  };
}
