import { NextResponse, type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest) {
  return await executeUnifiedPolicyMiddleware(request, {
    appType: 'superadmin',
    loginRoute: '/superadmin/login',
    publicRoutes: [],
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
