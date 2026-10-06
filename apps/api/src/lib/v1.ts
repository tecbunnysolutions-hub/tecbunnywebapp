import type { NextRequest, NextResponse } from 'next/server';

import { logger } from '@tecbunny/core';

import { apiFailure } from './api-contract';
import { ServiceError } from '../services/errors';

export const PUBLIC_READ_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=900';

export function getRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

export function finishV1<T extends NextResponse>(response: T, options: { requestId: string; cacheControl?: string }): T {
  response.headers.set('x-request-id', options.requestId);
  if (options.cacheControl) response.headers.set('Cache-Control', options.cacheControl);
  return response;
}

export function v1ErrorResponse(error: unknown, requestId: string, event: string) {
  const meta = { requestId };
  if (error instanceof ServiceError) {
    return finishV1(apiFailure(error.status, { code: error.code, message: error.message }, { meta }), { requestId });
  }
  logger.error(event, { requestId, error: error instanceof Error ? error.message : String(error) });
  return finishV1(apiFailure(500, { code: 'INTERNAL_ERROR', message: 'Internal server error.' }, { meta }), { requestId });
}
