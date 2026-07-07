import { createMiddleware } from '@tecbunny/core/auth/middleware-factory';

export const middleware = createMiddleware({
  appName: 'superadmin',
  publicRoutes: [
    { path: '/superadmin/login' }
  ],
  routeGuards: [
    {
      path: '/',
      prefix: true,
      isSuperadminOnly: true,
      redirectUrl: '/superadmin/login'
    }
  ]
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
