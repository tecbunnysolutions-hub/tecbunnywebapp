import { type NextFetchEvent, type NextRequest } from 'next/server';
import { emitEnterpriseProxyTelemetry } from '@tecbunny/core/enterprise-analytics-proxy';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const startedAt = Date.now();
  const response = await executeUnifiedPolicyMiddleware(request, {
    appType: 'api',
    loginRoute: '/login',
    publicRoutes: [
      'POST /api/auth/login',
      'GET /api/health',
      'POST /api/webhook/whatsapp',
    ],
  });
  emitEnterpriseProxyTelemetry(request, { application: 'waba', response, startedAt, event });
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};