import type { NextRequest } from 'next/server';

import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../lib/v1-auth';
import { ServiceError } from '../../../../../services/errors';
import { getInvoiceData } from '../../../../../services/invoices.service';

/** GET /api/v1/invoices/:orderId — owner or staff only. */
export async function GET(request: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  const requestId = getRequestId(request);
  try {
    const caller = await requireCaller(request, 'customer');
    const { orderId } = await context.params;
    if (!isSupabaseServiceConfigured) throw new ServiceError(503, 'NOT_CONFIGURED', 'Data service unavailable.');
    const data = await getInvoiceData(createServiceClient(), orderId);
    const customerId = data.order.customer_id;
    const isOwner = typeof customerId === 'string' && customerId === caller.userId;
    const isStaff = caller.role !== 'customer';
    if (!isOwner && !isStaff) {
      throw new ServiceError(403, 'FORBIDDEN', 'You do not have access to this invoice.');
    }
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.invoices.get_failed');
  }
}
