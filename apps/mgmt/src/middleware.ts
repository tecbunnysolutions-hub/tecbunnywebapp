import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@tecbunny/core/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request, {
    allowedRoles: ['admin', 'sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'superadmin'],
    loginRoute: '/auth/login',
    publicRoutes: [],
    onForbidden: () => new NextResponse('Forbidden: Insufficient Privileges', { status: 403 }),
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
    '/((?!_next/static|_next/image|favicon.ico|auth/login|api/).*)',
  ],
};
