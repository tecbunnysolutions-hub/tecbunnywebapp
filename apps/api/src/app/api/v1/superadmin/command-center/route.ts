import type { NextRequest } from 'next/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import { getSuperadminCommandCenterData } from '../../../../../lib/superadmin-dashboard-data';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';

/** GET /api/v1/superadmin/command-center - superadmin dashboard payload. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    await requireCaller(request, 'superadmin');
    const data = await getSuperadminCommandCenterData();
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.superadmin.command_center_failed');
  }
}
