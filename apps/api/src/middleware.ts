import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@tecbunny/core/supabase/middleware';

const allowedOrigins = [
  'https://tecbunny.com',
  'https://www.tecbunny.com',
  'https://staff.tecbunny.com',
  'https://superadmin.tecbunny.com',
  'https://api.tecbunny.com',
  'http://localhost:3000', // public
  'http://localhost:3001', // staff
  'http://localhost:3002', // superadmin
  'http://localhost:3003', // api
];

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const authHeader = request.headers.get('authorization');
  const isM2MAuth = authHeader === `Bearer ${process.env.INTERNAL_SERVICE_KEY}`;
  const pathname = request.nextUrl.pathname;

  // Protect Dashboard Routes using Centralized Auth
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    // We defer to updateSession to check authentication and role.
    const sessionResponse = await updateSession(request, {
      allowedRoles: ['superadmin'], // Assuming /dashboard in api is only for superadmin based on old code
      loginRoute: '/login',
      publicRoutes: [],
      onUnauthorized: (req: NextRequest) => {
         const loginUrl = new URL('/login', req.url);
         return NextResponse.redirect(loginUrl);
      },
      onForbidden: (req: NextRequest) => {
         const loginUrl = new URL('/login', req.url);
         return NextResponse.redirect(loginUrl);
      }
    });

    // updateSession returns a redirect or forbidden response if checks fail.
    if (sessionResponse.status !== 200) {
      // Except if they are already on /login and have a session, we redirect to dashboard
       if (pathname.startsWith('/login') && sessionResponse.status === 200) {
          const dashboardUrl = new URL('/dashboard', request.url);
          return NextResponse.redirect(dashboardUrl);
       }
       return sessionResponse;
    }
    
    if (pathname.startsWith('/login')) {
       // If updateSession returned 200, user is authenticated and authorized. Redirect away from login.
       const dashboardUrl = new URL('/dashboard', request.url);
       return NextResponse.redirect(dashboardUrl);
    }
  }

  // Handle CORS
  const response = NextResponse.next();
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin && isM2MAuth) {
    // Allow M2M
  } else if (!origin) {
    // Allow non-browser requests
  } else {
    return new NextResponse(null, { status: 403, statusText: 'Forbidden', headers: { 'Content-Type': 'text/plain' } });
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login'
  ]
};
