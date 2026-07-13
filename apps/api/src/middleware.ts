import { NextResponse, type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect Dashboard Routes and API routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/api')) {
    if (pathname.startsWith('/login')) {
      // Check session manually since updateSession short-circuits for the login route.
      const { requireSupabasePublicEnv } = await import('@tecbunny/core/supabase/env');
      const { createServerClient } = await import('@supabase/ssr');
      const { url, publicKey } = requireSupabasePublicEnv();
      const supabase = createServerClient(url, publicKey, {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
        }
      });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    return await executeUnifiedPolicyMiddleware(request, {
      appType: 'api',
      loginRoute: '/login',
      publicRoutes: ['/api/auth/extension'],
    });
  }

  // Handle CORS for non-protected or custom routes
  return await executeUnifiedPolicyMiddleware(request, { appType: 'api' });
}


export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login'
  ]
};
