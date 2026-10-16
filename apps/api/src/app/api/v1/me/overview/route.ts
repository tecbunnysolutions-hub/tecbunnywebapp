import type { NextRequest } from 'next/server';

import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';
import { ServiceError } from '../../../../../services/errors';
import { getMeOverview } from '../../../../../services/me.service';

/** GET /api/v1/me/overview - the signed-in user's profile, recent orders, tickets and quotes. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const caller = await requireCaller(request, 'customer');
    if (!isSupabaseServiceConfigured) throw new ServiceError(503, 'NOT_CONFIGURED', 'Data service unavailable.');
    const data = await getMeOverview(createServiceClient(), caller.userId);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.me.overview_failed');
  }
}
