import type { BlogListData, BlogListQuery, BlogPostDetail, BlogPostSummary } from '@tecbunny/contracts';
import type { SupabaseClient } from '@tecbunny/database';

import { ServiceError } from './errors';

const AUTHOR_COLUMNS = 'profiles(name, avatar_url)';
const SUMMARY_COLUMNS = `id, title, slug, excerpt, cover_image:cover_image_url, tags, published_at, metadata, updated_at, ${AUTHOR_COLUMNS}`;
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, content:body`;

type RawPost = Record<string, unknown> & { profiles?: unknown };

const firstOrSelf = (value: unknown) => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

export function normalizePost(row: RawPost) {
  const { metadata, profiles, body, cover_image_url, ...post } = row;
  const author = firstOrSelf(profiles) as Record<string, unknown> | null;
  const seo = metadata && typeof metadata === 'object' ? metadata as Record<string, unknown> : {};
  return {
    ...post,
    ...('body' in row ? { content: body } : {}),
    ...('cover_image_url' in row ? { cover_image: cover_image_url } : {}),
    ...('status' in row ? { status: row.status === 'active' && row.published_at ? 'published' : row.status } : {}),
    seo_description: typeof seo.seo_description === 'string' ? seo.seo_description : null,
    seo_title: typeof seo.seo_title === 'string' ? seo.seo_title : null,
    profiles: author ? {
      // Preserve the complete display name; do not infer culturally-specific name splits.
      first_name: typeof author.name === 'string' ? author.name : typeof author.first_name === 'string' ? author.first_name : null,
      last_name: typeof author.last_name === 'string' ? author.last_name : null,
      avatar_url: author.avatar_url,
    } : null,
  };
}

/** Map the existing editor contract onto the canonical storage schema. */
export function blogStorageFields(input: Record<string, unknown>, existingMetadata: unknown = {}) {
  const { content, cover_image, seo_title, seo_description, status, ...fields } = input;
  return {
    ...fields,
    ...(content !== undefined ? { body: content } : {}),
    ...(cover_image !== undefined ? { cover_image_url: cover_image } : {}),
    ...(status !== undefined ? { status: status === 'published' ? 'active' : status } : {}),
    ...(seo_title !== undefined || seo_description !== undefined ? { metadata: {
      ...(existingMetadata && typeof existingMetadata === 'object' && !Array.isArray(existingMetadata) ? existingMetadata : {}),
      ...(seo_title !== undefined ? { seo_title } : {}),
      ...(seo_description !== undefined ? { seo_description } : {}),
    } } : {}),
  };
}

export async function listPublishedPosts(db: SupabaseClient, query: BlogListQuery): Promise<BlogListData> {
  const from = (query.page - 1) * query.pageSize;
  const { data, error, count } = await db
    .from('blog_posts')
    .select(SUMMARY_COLUMNS, { count: 'estimated' })
    .eq('status', 'active')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .is('deleted_at', null)
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
    .eq('status', 'active')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load the blog post.');
  if (!data) throw new ServiceError(404, 'NOT_FOUND', 'Blog post not found.');

  return normalizePost(data as RawPost) as unknown as BlogPostDetail;
}
