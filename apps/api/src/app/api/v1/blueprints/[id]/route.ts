import type { NextRequest } from 'next/server';

import { createServiceClient } from '@tecbunny/database/admin';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { getPublishedBlueprint } from '../../../../../services/blueprints.service';

/** GET /api/v1/blueprints/:id - one published blueprint with creator profile. */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(request);
  const { id } = await context.params;
  try {
    // Service client: the creator profile join is not readable by the anon role.
    const blueprint = await getPublishedBlueprint(createServiceClient(), id);
    return finishV1(apiSuccess({ blueprint }, { meta: { requestId } }), {
      requestId,
      cacheControl: 'public, s-maxage=300, stale-while-revalidate=900',
    });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.blueprints.get_failed');
  }
}
