import type { SupabaseClient } from '@tecbunny/database';
import { describe, expect, it, vi } from 'vitest';

import { blogStorageFields, getPublishedPostBySlug, listPublishedPosts, normalizePost } from './blog.service';
import { ServiceError } from './errors';

type Result = { data: unknown; error: unknown; count?: number | null };

function fakeDb(result: Result) {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'not', 'lte', 'is', 'order', 'range']) {
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
    expect(calls).toContainEqual(['eq', ['status', 'active']]);
    expect(calls).toContainEqual(['not', ['published_at', 'is', null]]);
    expect(calls).toContainEqual(['lte', ['published_at', expect.any(String)]]);
    expect(calls).toContainEqual(['is', ['deleted_at', null]]);
    expect(String(calls.find(([method]) => method === 'select')?.[1][0])).toContain('cover_image:cover_image_url');
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

  it('maps canonical author/SEO fields without exposing arbitrary metadata', () => {
    expect(normalizePost({ id: '1', profiles: { name: 'Ada Lovelace', avatar_url: null }, metadata: { seo_description: 'Description', internal_note: 'private' } })).toEqual({
      id: '1', seo_description: 'Description', seo_title: null,
      profiles: { first_name: 'Ada Lovelace', last_name: null, avatar_url: null },
    });
  });
});

describe('blog editor storage mapping', () => {
  it('maps editor fields and publication state to the canonical schema', () => {
    expect(blogStorageFields({ content: 'Body', cover_image: null, status: 'published', seo_title: 'Title' })).toEqual({
      body: 'Body', cover_image_url: null, status: 'active', metadata: { seo_title: 'Title' },
    });
  });
  it('retains unrelated metadata and unspecified SEO fields on partial updates', () => {
    expect(blogStorageFields({ seo_description: 'New' }, { seo_title: 'Old title', internal: true })).toEqual({
      metadata: { seo_title: 'Old title', internal: true, seo_description: 'New' },
    });
    expect(blogStorageFields({ title: 'Edited' })).toEqual({ title: 'Edited' });
  });
});

describe('getPublishedPostBySlug', () => {
  it('returns the post when found', async () => {
    const { db, calls } = fakeDb({ data: { id: '1', slug: 's', profiles: null }, error: null });
    await expect(getPublishedPostBySlug(db, 's')).resolves.toMatchObject({ slug: 's', profiles: null });
    expect(String(calls.find(([method]) => method === 'select')?.[1][0])).toContain('content:body');
    expect(calls).toContainEqual(['eq', ['status', 'active']]);
    expect(calls).toContainEqual(['is', ['deleted_at', null]]);
  });

  it('throws NOT_FOUND when the post does not exist or is unpublished', async () => {
    const { db } = fakeDb({ data: null, error: null });
    const error = await getPublishedPostBySlug(db, 'missing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});
