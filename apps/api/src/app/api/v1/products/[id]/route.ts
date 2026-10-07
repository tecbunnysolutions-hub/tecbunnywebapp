import type { NextRequest } from 'next/server';

import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { getPublicProductById } from '../../../../../services/products.service';

const PRODUCT_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

/** GET /api/v1/products/:id - one publicly visible product. */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(request);
  const { id } = await context.params;

  try {
    // Same client choice the storefront used: the service client sees rows RLS may hide; visibility is re-checked in the service.
    const db = isSupabaseServiceConfigured ? createServiceClient() : createPublicClient();
    const product = await getPublicProductById(db, id);
    return finishV1(apiSuccess({ product }, { meta: { requestId } }), { requestId, cacheControl: PRODUCT_CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.products.get_failed');
  }
}
