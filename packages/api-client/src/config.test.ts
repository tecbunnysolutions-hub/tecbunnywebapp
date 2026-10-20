import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_PUBLIC_CONFIG } from '@tecbunny/contracts';

import { createApiClient } from './client';
import { configApi } from './config';

const body = (data: unknown) =>
  new Response(JSON.stringify({ success: true, message: '', data, errors: [], meta: {} }), { status: 200 });

describe('configApi', () => {
  it('caches for the TTL and refetches afterwards', async () => {
    const custom = { ...DEFAULT_PUBLIC_CONFIG, turnstileSiteKey: 'k' };
    const fetchMock = vi.fn().mockImplementation(async () => body(custom));
    let t = 0;
    const api = configApi(createApiClient({ baseUrl: 'https://api.test', fetch: fetchMock }), () => t);

    expect((await api.getPublic()).turnstileSiteKey).toBe('k');
    await api.getPublic();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    t = 61_000;
    await api.getPublic();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to safe defaults when the API is unreachable', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'));
    const api = configApi(createApiClient({ baseUrl: 'https://api.test', fetch: fetchMock }));
    await expect(api.getPublic()).resolves.toEqual(DEFAULT_PUBLIC_CONFIG);
  });
});
