import { createHash } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { apiSuccess } from '../../../../../lib/api-contract';
import { getRequestId, v1ErrorResponse } from '../../../../../lib/v1';
import { buildPublicConfig } from '../../../../../services/public-config.service';

const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=900';

/** GET /api/v1/config/public - browser-safe configuration (strict allowlist, ETag-validated). */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  try {
    const config = await buildPublicConfig();
    const etag = `"${createHash('sha256').update(JSON.stringify(config)).digest('base64url').slice(0, 32)}"`;
    const headers = { ETag: etag, 'Cache-Control': CACHE_CONTROL, 'x-request-id': requestId };

    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    const response = apiSuccess(config, { meta: { requestId } });
    for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    return response;
  } catch (error) {
    return v1ErrorResponse(error, requestId, 'v1.config.public_failed');
  }
}
