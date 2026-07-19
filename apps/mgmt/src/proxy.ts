import { type NextFetchEvent, type NextRequest } from 'next/server';
import { emitEnterpriseProxyTelemetry } from '@tecbunny/core/enterprise-analytics-proxy';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const startedAt = Date.now();
  const response = await executeUnifiedPolicyMiddleware(request, {
    appType: 'mgmt',
    loginRoute: '/auth/login',
    publicRoutes: [],
  });
  emitEnterpriseProxyTelemetry(request, { application: 'mgmt', response, startedAt, event });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (the login page itself to prevent redirect loops)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/login).*)',
  ],
};