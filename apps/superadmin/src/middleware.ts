import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from '@tecbunny/core/supabase/env';

export async function middleware(request: NextRequest) {
  let supabasePublicEnv: ReturnType<typeof requireSupabasePublicEnv>;
  try {
    supabasePublicEnv = requireSupabasePublicEnv();
  } catch (error) {
    console.error('Middleware Supabase configuration error:', error);
    return new NextResponse('Internal Server Error: Missing Supabase Config', { status: 500 });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    supabasePublicEnv.url,
    supabasePublicEnv.publicKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!user) {
    // Avoid infinite redirect loop
    if (request.nextUrl.pathname === '/superadmin/login') {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/superadmin/login';
    return NextResponse.redirect(url);
  }

  // Assuming roles are embedded in user_metadata or app_metadata
  const userRole = user.app_metadata?.role || user.user_metadata?.role;

  // Strict Superadmin boundary check
  if (userRole !== 'superadmin') {
    return new NextResponse('Forbidden: Superadmin Privileges Required', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
