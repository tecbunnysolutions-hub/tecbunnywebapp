import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess, apiValidationError } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, PUBLIC_READ_CACHE_CONTROL, v1ErrorResponse } from '../../../../../lib/v1';
import { getPublishedPostBySlug } from '../../../../../services/blog.service';

const SlugSchema = z.string().trim().min(1).max(200);

/** GET /api/v1/blog/:slug - one published post. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const requestId = getRequestId(request);
  const slug = SlugSchema.safeParse((await params).slug);
  if (!slug.success) return finishV1(apiValidationError(slug.error, { requestId }), { requestId });

  try {
    const post = await getPublishedPostBySlug(createPublicClient(), slug.data);
    return finishV1(apiSuccess({ post }, { meta: { requestId } }), { requestId, cacheControl: PUBLIC_READ_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.blog.get_failed');
  }
}
