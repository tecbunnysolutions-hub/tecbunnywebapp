import {
  BlogListDataSchema,
  BlogPostDataSchema,
  type BlogListData,
  type BlogListQuery,
  type BlogPostDetail,
} from '@tecbunny/contracts';

import type { ApiClient, NextFetchOptions } from './client';

type ReadOptions = { next?: NextFetchOptions; signal?: AbortSignal };

export const BLOG_CACHE_TAG = 'blog';

export function blogApi(client: ApiClient) {
  return {
    async list(query: Partial<BlogListQuery> = {}, opts: ReadOptions = {}): Promise<BlogListData> {
      const data = await client.request('/api/v1/blog', {
        query,
        schema: BlogListDataSchema,
        signal: opts.signal,
        next: opts.next ?? { revalidate: 300, tags: [BLOG_CACHE_TAG] },
      });
      return data ?? { posts: [], total: 0, page: 1, pageSize: query.pageSize ?? 20 };
    },

    async get(slug: string, opts: ReadOptions = {}): Promise<BlogPostDetail | null> {
      const data = await client.request(`/api/v1/blog/${encodeURIComponent(slug)}`, {
        schema: BlogPostDataSchema,
        signal: opts.signal,
        nullOnStatus: [404],
        next: opts.next ?? { revalidate: 300, tags: [BLOG_CACHE_TAG, `${BLOG_CACHE_TAG}:${slug}`] },
      });
      return data?.post ?? null;
    },
  };
}
