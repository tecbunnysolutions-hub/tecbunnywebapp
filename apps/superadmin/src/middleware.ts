import { type NextFetchEvent, type NextRequest } from 'next/server';
import { emitEnterpriseProxyTelemetry } from '@tecbunny/core/enterprise-analytics-proxy';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const startedAt = Date.now();
  const response = await executeUnifiedPolicyMiddleware(request, {
    appType: 'superadmin',
    loginRoute: '/superadmin/login',
    publicRoutes: [
      'POST /superadmin/mgmt/login',
      'GET /superadmin/mgmt/logout',
      'POST /superadmin/mgmt/logout',
    ],
  });
  emitEnterpriseProxyTelemetry(request, { application: 'superadmin', response, startedAt, event });
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    '/api/users/:path*',
    '/api/roles/:path*',
    '/api/permissions/:path*',
    '/api/organizations/:path*',
    '/api/branches/:path*',
    '/api/health/:path*',
    '/api/superadmin/:path*',
  ],
};
