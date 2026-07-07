import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const superadminCookie = request.cookies.get('superadmin-session')?.value;
  
  let isSuperadmin = false;
  if (superadminCookie) {
    isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));
  }

  // If no valid superadmin session, redirect to login
  if (!isSuperadmin) {
    // Avoid infinite redirect loop
    if (request.nextUrl.pathname === '/superadmin/login') {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/superadmin/login';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
