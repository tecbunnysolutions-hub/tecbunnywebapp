import {
  BlueprintDataSchema,
  BlueprintListDataSchema,
  type Blueprint,
  type BlueprintListData,
} from '@tecbunny/contracts';

import type { ApiClient, NextFetchOptions } from './client';

type ReadOptions = { next?: NextFetchOptions; signal?: AbortSignal };

export const BLUEPRINTS_CACHE_TAG = 'blueprints';

export function blueprintsApi(client: ApiClient) {
  return {
    async list(opts: ReadOptions = {}): Promise<BlueprintListData> {
      const data = await client.request('/api/v1/blueprints', {
        schema: BlueprintListDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 600, tags: [BLUEPRINTS_CACHE_TAG] },
      });
      return data ?? { blueprints: [] };
    },

    async get(id: string, opts: ReadOptions = {}): Promise<Blueprint | null> {
      const data = await client.request(`/api/v1/blueprints/${encodeURIComponent(id)}`, {
        schema: BlueprintDataSchema,
        signal: opts.signal,
        nullOnStatus: [404],
        next: opts.next ?? { revalidate: 300, tags: [BLUEPRINTS_CACHE_TAG, `${BLUEPRINTS_CACHE_TAG}:${id}`] },
      });
      return data?.blueprint ?? null;
    },
  };
}
