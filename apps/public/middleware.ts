import { NextResponse, type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define strictly protected routes in the public app that REQUIRE authentication
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/admin', '/payment', '/checkout'];
  const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  const publicRoutes = [
    '/api/auth',
      '/api/health',
      '/api/settings',
      '/api/metadata',
      '/api/page-content',
      '/api/auto-offers',
      '/api/offers',
      '/api/coupons',
      '/api/products',
      '/api/projects',
      '/api/checkout/calculate',
      '/api/analytics/track',
      '/api/captcha',
      '/api/contact-messages',
      '/api/free-installation-slots',
      '/api/promotions',
      '/api/warranty',
      '/api/quotes',
      '/api/uploads',
      '/api/webhooks',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If the route is NOT explicitly protected, allow it without initializing auth middleware
  if (!isProtected) {
    return NextResponse.next();
  }

  return await executeUnifiedPolicyMiddleware(request, {
    appType: 'public',
    loginRoute: '/auth/login',
    publicRoutes,
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
