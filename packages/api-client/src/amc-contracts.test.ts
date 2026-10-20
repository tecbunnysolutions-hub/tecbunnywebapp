import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from './client';
import { amcContractsApi } from './amc-contracts';

describe('amcContractsApi', () => {
  it('sends validated staff list filters to the API without caching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        message: '',
        data: { contracts: [], counts: { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0 } },
        errors: [],
        meta: {},
      }), { status: 200 }),
    );
    const api = amcContractsApi(createApiClient({ baseUrl: 'https://api.test', fetch: fetchMock }));

    await expect(api.list({ search: 'Acme & Sons', status: 'EXPIRING' })).resolves.toEqual({
      contracts: [],
      counts: { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0 },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/admin/amc-contracts?search=Acme+%26+Sons&status=EXPIRING');
    expect(init.cache).toBe('no-store');
  });
});
