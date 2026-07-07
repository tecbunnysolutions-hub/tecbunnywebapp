import { createMiddleware } from '@tecbunny/core/auth/middleware-factory';
import type { NextRequest } from 'next/server';

const factoryMiddleware = createMiddleware({
  appName: 'api',
  enableCors: true,
  allowedOrigins: [
    'https://tecbunny.com',
    'https://www.tecbunny.com',
    'https://staff.tecbunny.com',
    'https://superadmin.tecbunny.com',
    'https://api.tecbunny.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ],
  routeGuards: [
    { path: '/dashboard', isSuperadminOnly: true, prefix: true }
  ]
});

export async function middleware(request: NextRequest) {
  // Let factory handle CORS, M2M, Superadmin checking, and RBAC
  return await factoryMiddleware(request as any);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login'
  ]
};
