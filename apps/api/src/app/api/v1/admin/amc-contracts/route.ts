import type { NextRequest } from 'next/server';

import { AmcContractQuerySchema } from '@tecbunny/contracts';
import { isAtLeast } from '@tecbunny/core/roles';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

import { apiSuccess, apiValidationError } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';
import { listAmcContracts } from '../../../../../services/amc-contracts.service';
import { ServiceError } from '../../../../../services/errors';

/** GET /api/v1/admin/amc-contracts - service-manager AMC contract list and summary. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const caller = await requireCaller(request, 'customer');
    if (caller.role !== 'service_manager' && !isAtLeast(caller.role, 'admin')) {
      throw new ServiceError(403, 'FORBIDDEN', 'Service manager access is required.');
    }
    const query = AmcContractQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.success) return finishV1(apiValidationError(query.error, { requestId }), { requestId });
    if (!isSupabaseServiceConfigured) throw new ServiceError(503, 'NOT_CONFIGURED', 'Data service unavailable.');

    const data = await listAmcContracts(createServiceClient(), query.data);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.admin.amc_contracts_failed');
  }
}
