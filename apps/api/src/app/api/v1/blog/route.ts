import type { NextRequest } from 'next/server';

import { BlogListQuerySchema } from '@tecbunny/contracts';
import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess, apiValidationError } from '../../../../lib/api-contract';
import { finishV1, getRequestId, PUBLIC_READ_CACHE_CONTROL, v1ErrorResponse } from '../../../../lib/v1';
import { listPublishedPosts } from '../../../../services/blog.service';

/** GET /api/v1/blog - published posts, newest first. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const query = BlogListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return finishV1(apiValidationError(query.error, { requestId }), { requestId });

  try {
    const data = await listPublishedPosts(createPublicClient(), query.data);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PUBLIC_READ_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.blog.list_failed');
  }
}
