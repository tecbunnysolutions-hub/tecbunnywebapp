import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ApiError, createApiClient } from './client';

const ok = (data: unknown) =>
  new Response(JSON.stringify({ success: true, message: '', data, errors: [], meta: {} }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const failure = (status: number, code: string) =>
  new Response(JSON.stringify({ success: false, message: 'nope', data: null, errors: [{ code, message: 'nope' }], meta: {} }), {
    status,
    headers: { 'x-request-id': 'req-1' },
  });

const schema = z.object({ value: z.number() });

describe('createApiClient', () => {
  it('returns validated data and sends the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ value: 1 }));
    const client = createApiClient({ baseUrl: 'https://api.test/', getToken: () => 'abc', fetch: fetchMock });

    await expect(client.request('/api/v1/x', { schema, query: { a: 1, b: undefined } })).resolves.toEqual({ value: 1 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/x?a=1');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
  });

  it('rejects responses that break the contract', async () => {
    const client = createApiClient({ baseUrl: 'https://api.test', fetch: vi.fn().mockResolvedValue(ok({ value: 'x' })) });
    await expect(client.request('/p', { schema })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('normalizes API errors and exposes the request id', async () => {
    const client = createApiClient({ baseUrl: 'https://api.test', fetch: vi.fn().mockResolvedValue(failure(403, 'FORBIDDEN')) });
    const error = await client.request('/p', { schema }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, code: 'FORBIDDEN', requestId: 'req-1' });
  });

  it('returns null for statuses listed in nullOnStatus', async () => {
    const client = createApiClient({ baseUrl: 'https://api.test', fetch: vi.fn().mockResolvedValue(failure(404, 'NOT_FOUND')) });
    await expect(client.request('/p', { schema, nullOnStatus: [404] })).resolves.toBeNull();
  });

  it('retries a GET once on 503 but never retries a POST', async () => {
    const getFetch = vi.fn().mockResolvedValueOnce(failure(503, 'DOWN')).mockResolvedValueOnce(ok({ value: 2 }));
    await expect(createApiClient({ baseUrl: 'https://api.test', fetch: getFetch }).request('/p', { schema })).resolves.toEqual({ value: 2 });
    expect(getFetch).toHaveBeenCalledTimes(2);

    const postFetch = vi.fn().mockResolvedValue(failure(503, 'DOWN'));
    await expect(
      createApiClient({ baseUrl: 'https://api.test', fetch: postFetch }).request('/p', { schema, method: 'POST', body: {} }),
    ).rejects.toMatchObject({ status: 503 });
    expect(postFetch).toHaveBeenCalledTimes(1);
  });

  it('reports a timeout as TIMEOUT', async () => {
    const hang = vi.fn((_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('timeout')));
      }),
    );
    const client = createApiClient({ baseUrl: 'https://api.test', timeoutMs: 5, fetch: hang as unknown as typeof fetch });
    await expect(client.request('/p', { schema, method: 'POST', body: {} })).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});
