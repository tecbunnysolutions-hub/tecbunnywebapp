import {
  FaqListDataSchema,
  HomeContentDataSchema,
  ServiceListDataSchema,
  type FaqListData,
  type HomeContentData,
  type ServiceListData,
} from '@tecbunny/contracts';

import type { ApiClient, NextFetchOptions } from './client';

type ReadOptions = { next?: NextFetchOptions; signal?: AbortSignal };

export const CONTENT_CACHE_TAG = 'content';

export function contentApi(client: ApiClient) {
  return {
    async home(opts: ReadOptions = {}): Promise<HomeContentData> {
      const data = await client.request('/api/v1/content/home', {
        schema: HomeContentDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 60, tags: [CONTENT_CACHE_TAG, 'content:home'] },
      });
      return data ?? { partnerBrands: null, heroCarousel: null };
    },

    async faqs(opts: ReadOptions = {}): Promise<FaqListData> {
      const data = await client.request('/api/v1/content/faqs', {
        schema: FaqListDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 300, tags: [CONTENT_CACHE_TAG, 'content:faqs'] },
      });
      return data ?? { faqs: [] };
    },

    async services(opts: ReadOptions = {}): Promise<ServiceListData> {
      const data = await client.request('/api/v1/services', {
        schema: ServiceListDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 300, tags: ['services'] },
      });
      return data ?? { services: [] };
    },
  };
}
