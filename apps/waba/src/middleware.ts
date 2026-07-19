import { type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';

export async function middleware(request: NextRequest) {
  return await executeUnifiedPolicyMiddleware(request, {
    appType: 'api',
    loginRoute: '/login',
    publicRoutes: [
      'POST /api/auth/login',
      'GET /api/health',
      'POST /api/webhook/whatsapp',
    ],
  });
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};