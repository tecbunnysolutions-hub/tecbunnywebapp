import type { NextRequest } from 'next/server';

import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { getHomeContent } from '../../../../../services/content.service';

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

/** GET /api/v1/content/home - partner brands and hero carousel. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const data = await getHomeContent(createPublicClient());
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.content.home_failed');
  }
}
