import type { NextRequest } from 'next/server';

import { ProductListQuerySchema } from '@tecbunny/contracts';
import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess, apiValidationError } from '../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../lib/v1';
import { listPublicProducts } from '../../../../services/products.service';

// Prices and publication changes should show up within a minute.
const PRODUCTS_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

/** GET /api/v1/products - publicly visible catalogue page plus active auto offers. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const query = ProductListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return finishV1(apiValidationError(query.error, { requestId }), { requestId });

  try {
    const data = await listPublicProducts(createPublicClient(), query.data);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: PRODUCTS_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.products.list_failed');
  }
}
