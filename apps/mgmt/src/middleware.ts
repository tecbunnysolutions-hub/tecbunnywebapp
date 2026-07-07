import { createMiddleware } from '@tecbunny/core/auth/middleware-factory';

export const middleware = createMiddleware({
  appName: 'mgmt',
  publicRoutes: [
    { path: '/auth/login', prefix: true }
  ],
  routeGuards: [
    { 
      path: '/', 
      prefix: true, 
      requireAuth: true,
      allowedRoles: ['admin', 'sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'superadmin'],
      redirectUrl: '/auth/login'
    }
  ]
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/login|api/).*)',
  ],
};
