import { z } from 'zod';

import { apiEnvelope, paginationQuery } from './envelope';

export const BlogAuthorSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  avatar_url: z.string().nullish(),
});

export const BlogPostSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  cover_image: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  published_at: z.string().nullable(),
  profiles: BlogAuthorSchema.nullable(),
});

export const BlogPostDetailSchema = BlogPostSummarySchema.extend({
  content: z.string(),
  seo_title: z.string().nullish(),
  seo_description: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const BlogListQuerySchema = paginationQuery({ pageSize: 20, maxPageSize: 50 });

export const BlogListDataSchema = z.object({
  posts: z.array(BlogPostSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const BlogPostDataSchema = z.object({ post: BlogPostDetailSchema });

export const BlogListResponseSchema = apiEnvelope(BlogListDataSchema);
export const BlogPostResponseSchema = apiEnvelope(BlogPostDataSchema);

export type BlogAuthor = z.infer<typeof BlogAuthorSchema>;
export type BlogPostSummary = z.infer<typeof BlogPostSummarySchema>;
export type BlogPostDetail = z.infer<typeof BlogPostDetailSchema>;
export type BlogListQuery = z.infer<typeof BlogListQuerySchema>;
export type BlogListData = z.infer<typeof BlogListDataSchema>;
