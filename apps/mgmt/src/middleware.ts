import { type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest) {
  return await executeUnifiedPolicyMiddleware(request, {
    appType: 'mgmt',
    loginRoute: '/auth/login',
    publicRoutes: [],
  });
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
