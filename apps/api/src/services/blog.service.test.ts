import type { SupabaseClient } from '@tecbunny/database';
import { describe, expect, it, vi } from 'vitest';

import { getPublishedPostBySlug, listPublishedPosts } from './blog.service';
import { ServiceError } from './errors';

type Result = { data: unknown; error: unknown; count?: number | null };

function fakeDb(result: Result) {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'order', 'range']) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.maybeSingle = vi.fn(async () => result);
  builder.then = (resolve: (value: Result) => unknown) => resolve(result);
  const from = vi.fn(() => builder);
  return { db: { from } as unknown as SupabaseClient, from, calls };
}

describe('listPublishedPosts', () => {
  it('only reads published posts, newest first, with the requested page window', async () => {
    const { db, from, calls } = fakeDb({ data: [], error: null, count: 0 });
    await listPublishedPosts(db, { page: 3, pageSize: 10 });

    expect(from).toHaveBeenCalledWith('blog_posts');
    expect(calls).toContainEqual(['eq', ['status', 'published']]);
    expect(calls).toContainEqual(['order', ['published_at', { ascending: false }]]);
    expect(calls).toContainEqual(['range', [20, 29]]);
  });

  it('normalizes an array-shaped author relation to a single object', async () => {
    const { db } = fakeDb({
      data: [{ id: '1', slug: 'a', profiles: [{ first_name: 'Ada', last_name: 'L' }] }],
      error: null,
      count: 1,
    });
    const result = await listPublishedPosts(db, { page: 1, pageSize: 20 });
    expect(result.total).toBe(1);
    expect(result.posts[0].profiles).toEqual({ first_name: 'Ada', last_name: 'L' });
  });

  it('maps database failures to an upstream ServiceError', async () => {
    const { db } = fakeDb({ data: null, error: { message: 'boom' } });
    await expect(listPublishedPosts(db, { page: 1, pageSize: 20 })).rejects.toMatchObject({ status: 502, code: 'UPSTREAM_ERROR' });
  });
});

describe('getPublishedPostBySlug', () => {
  it('returns the post when found', async () => {
    const { db } = fakeDb({ data: { id: '1', slug: 's', profiles: null }, error: null });
    await expect(getPublishedPostBySlug(db, 's')).resolves.toMatchObject({ slug: 's', profiles: null });
  });

  it('throws NOT_FOUND when the post does not exist or is unpublished', async () => {
    const { db } = fakeDb({ data: null, error: null });
    const error = await getPublishedPostBySlug(db, 'missing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});
