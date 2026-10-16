import type { NextRequest } from 'next/server';

import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { createPublicClient } from '@tecbunny/database/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import { finishV1, getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { listActiveFaqs } from '../../../../../services/content.service';

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=900';

/** GET /api/v1/content/faqs - active FAQs grouped by category order. */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const db = isSupabaseServiceConfigured ? createServiceClient() : createPublicClient();
    const data = await listActiveFaqs(db);
    return finishV1(apiSuccess(data, { meta: { requestId } }), { requestId, cacheControl: CACHE_CONTROL });
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.content.faqs_failed');
  }
}
