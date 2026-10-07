import {
  ProductListDataSchema,
  type ProductListData,
  type ProductListQuery,
} from '@tecbunny/contracts';

import type { ApiClient, NextFetchOptions } from './client';

type ReadOptions = { next?: NextFetchOptions; signal?: AbortSignal };

export const PRODUCTS_CACHE_TAG = 'products';

export function productsApi(client: ApiClient) {
  return {
    async list(query: Partial<ProductListQuery> = {}, opts: ReadOptions = {}): Promise<ProductListData> {
      const data = await client.request('/api/v1/products', {
        query,
        schema: ProductListDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 60, tags: [PRODUCTS_CACHE_TAG] },
      });
      return data ?? { products: [], offers: [], total: 0, page: 1, pageSize: query.pageSize ?? 200 };
    },
  };
}
