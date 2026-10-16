import type { NextRequest } from 'next/server';

import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess } from '../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../lib/v1';
import { listPublishedBlueprints } from '../../../../services/blueprints.service';

/** GET /api/v1/blueprints - published blueprint ids for sitemaps. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const data = await listPublishedBlueprints(createPublicClient());
    return finishV1(apiSuccess(data, { meta: { requestId } }), {
      requestId,
      cacheControl: 'public, s-maxage=600, stale-while-revalidate=3600',
    });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.blueprints.list_failed');
  }
}
