import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { requireSupabasePublicEnv } from '@tecbunny/core/supabase/env';

// Allowed staff roles for the mgmt dashboard
const ALLOWED_ROLES = ['admin', 'sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'superadmin'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { url, publicKey } = requireSupabasePublicEnv();
  const supabase = createServerClient(url, publicKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    return NextResponse.redirect(loginUrl);
  }

  // Assuming roles are embedded in user_metadata or app_metadata
  const userRole = user.app_metadata?.role || user.user_metadata?.role;

  if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
    // If authenticated but wrong role, return a 403 or redirect
    return new NextResponse('Forbidden: Insufficient Privileges', { status: 403 });
  }

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
    '/((?!_next/static|_next/image|favicon.ico|auth/login|api/).*)',
  ],
};
