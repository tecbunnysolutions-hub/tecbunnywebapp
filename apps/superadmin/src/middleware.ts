import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@tecbunny/core/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request, {
    allowedRoles: ['superadmin'],
    loginRoute: '/superadmin/login',
    publicRoutes: [],
    onForbidden: () => new NextResponse('Forbidden: Superadmin Privileges Required', { status: 403 }),
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
