import type { BlogListData, BlogListQuery, BlogPostDetail, BlogPostSummary } from '@tecbunny/contracts';
import type { SupabaseClient } from '@tecbunny/database';

import { ServiceError } from './errors';

const AUTHOR_COLUMNS = 'profiles(first_name, last_name, avatar_url)';
const SUMMARY_COLUMNS = `id, title, slug, excerpt, cover_image, tags, published_at, seo_description, updated_at, ${AUTHOR_COLUMNS}`;
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, content, seo_title`;

type RawPost = Record<string, unknown> & { profiles?: unknown };

const firstOrSelf = (value: unknown) => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

const normalizePost = (row: RawPost) => ({ ...row, profiles: firstOrSelf(row.profiles) });

export async function listPublishedPosts(db: SupabaseClient, query: BlogListQuery): Promise<BlogListData> {
  const from = (query.page - 1) * query.pageSize;
  const { data, error, count } = await db
    .from('blog_posts')
    .select(SUMMARY_COLUMNS, { count: 'estimated' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + query.pageSize - 1);

  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load blog posts.');

  return {
    posts: ((data ?? []) as RawPost[]).map(normalizePost) as unknown as BlogPostSummary[],
    total: count ?? 0,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getPublishedPostBySlug(db: SupabaseClient, slug: string): Promise<BlogPostDetail> {
  const { data, error } = await db
    .from('blog_posts')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load the blog post.');
  if (!data) throw new ServiceError(404, 'NOT_FOUND', 'Blog post not found.');

  return normalizePost(data as RawPost) as unknown as BlogPostDetail;
}
