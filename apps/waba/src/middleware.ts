import { type NextRequest } from 'next/server';
import { emitEnterpriseProxyTelemetry, type EnterpriseProxyEvent } from '@tecbunny/core/enterprise-analytics-proxy';
import { executeUnifiedPolicyMiddleware, STAFF_GATEWAY_ROLES } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest, event: EnterpriseProxyEvent) {
  const startedAt = Date.now();
  const response = await executeUnifiedPolicyMiddleware(request, {
    appType: 'api',
    loginRoute: '/login',
    // WABA is a staff workspace; customers never reach its APIs.
    allowedRoles: STAFF_GATEWAY_ROLES,
    publicRoutes: [
      'POST /api/auth/login',
      'GET /api/health',
      'GET /api/webhook/whatsapp',
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