import type { NextRequest } from 'next/server';

import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

import { apiSuccess } from '../../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../../lib/v1';
import { PRIVATE_CACHE_CONTROL, requireCaller } from '../../../../../../lib/v1-auth';
import { ServiceError } from '../../../../../../services/errors';
import { getMyOrder } from '../../../../../../services/me.service';
import { verifyGuestOrderAccessToken } from '../../../../../../lib/guest-order-access';

/** GET /api/v1/me/orders/:orderId - one of the signed-in user's own orders. */
export async function GET(request: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  const requestId = getRequestId(request);
  try {
    const { orderId } = await context.params;
    if (!isSupabaseServiceConfigured) throw new ServiceError(503, 'NOT_CONFIGURED', 'Data service unavailable.');

    const guestToken = request.headers.get('x-guest-order-token');
    if (verifyGuestOrderAccessToken(guestToken, orderId)) {
      const { data, error } = await createServiceClient()
        .from('orders')
        .select('id, total, status, payment_method, payment_status, payment_reference, created_at, customer_name, customer_email, customer_phone, items')
        .eq('id', orderId)
        .maybeSingle();
      if (error) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load order.');
      if (!data) throw new ServiceError(404, 'NOT_FOUND', 'Order not found.');
      const { payment_reference: paymentReference, ...order } = data;
      return finishV1(apiSuccess({
        order: {
          ...order,
          payment_claim_submitted: Boolean(paymentReference),
        } as unknown as Record<string, unknown>,
      }, { meta: { requestId } }), {
        requestId,
        cacheControl: PRIVATE_CACHE_CONTROL,
      });
    }

    const caller = await requireCaller(request, 'customer');
    const data = await getMyOrder(createServiceClient(), caller.userId, orderId);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRIVATE_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.me.order_failed');
  }
}
