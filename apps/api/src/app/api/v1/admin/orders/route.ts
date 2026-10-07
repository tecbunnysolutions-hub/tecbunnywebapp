import type { NextRequest } from 'next/server';

import { AdminOrdersQuerySchema } from '@tecbunny/contracts';
import { isAtLeast } from '@tecbunny/core/roles';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

import { apiSuccess, apiValidationError } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';
import { listAdminOrders } from '../../../../../services/admin-orders.service';
import { ServiceError } from '../../../../../services/errors';

/** GET /api/v1/admin/orders - staff order list; non-admins only see orders they processed. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const caller = await requireCaller(request, 'staff');
    const query = AdminOrdersQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.success) return finishV1(apiValidationError(query.error, { requestId }), { requestId });
    if (!isSupabaseServiceConfigured) throw new ServiceError(503, 'NOT_CONFIGURED', 'Data service unavailable.');

    const data = await listAdminOrders(createServiceClient(), query.data, {
      userId: caller.userId,
      canViewAll: isAtLeast(caller.role, 'admin'),
    });
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.admin.orders_failed');
  }
}
