import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';
import { emitEnterpriseProxyTelemetry } from '@tecbunny/core/enterprise-analytics-proxy';

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const startedAt = Date.now();
  const pathname = request.nextUrl.pathname;

  // Protect Dashboard Routes and API routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/api')) {
    if (pathname.startsWith('/login')) {
      // Check session manually since updateSession short-circuits for the login route.
      const { requireSupabasePublicEnv } = await import('@tecbunny/database');
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

    const response = await executeUnifiedPolicyMiddleware(request, {
      appType: 'api',
      loginRoute: '/login',
      publicRoutes: [
        'GET /api/auth/session',
        'POST /api/auth/callback',
        'GET /api/auth/callback',
        'POST /api/auth/signup',
        'POST /api/auth/complete-signup',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password',
        'POST /api/auth/send-otp',
        'POST /api/auth/verify-otp',
        'POST /api/auth/resend-verification',
        'POST /api/auth/resolve-phone',
        'POST /api/auth/quick-login',
        'POST /api/auth/extension',
        'POST /api/admin-auth/login',
        'POST /api/payment/payu/callback',
        'POST /api/payment/payu/initiate',
        'POST /api/webhooks/orders/shipped',
        '/api/health',
        'GET /api/metadata',
        'GET /api/page-content',
        'GET /api/auto-offers',
        'GET /api/offers',
        'GET /api/coupons',
        'GET /api/products',
        'GET /api/projects',
        'POST /api/checkout/calculate',
        'POST /api/analytics/track',
        'GET /api/captcha/config',
        'POST /api/captcha/verify',
        'POST /api/contact-messages',
        'GET /api/free-installation-slots',
        'GET /api/custom-setup-offers',
        'POST /api/promotions/claim-viral',
        'POST /api/promotions/free-installation-claim',
        'POST /api/quotes',
        'POST /api/uploads/quote-documents',
        // The tRPC catch-all route (/api/trpc/[trpc]) hosts a mix of public and
        // protected procedures (see packages/rpc/src/routers/*.ts -- e.g.
        // featureFlags.getAll, coupons.getAll/getByCode/getById, offers.getAll,
        // projects.getAll, pageContent.get, contactMessages.submit are all
        // `publicProcedure`, called anonymously by every public-site page load).
        // This gateway-level auth wall has no visibility into individual
        // procedure names -- httpBatchLink can even batch several procedure
        // calls into one comma-joined path (e.g.
        // /api/trpc/featureFlags.getAll,pageContent.get) -- so it was blocking
        // ALL anonymous tRPC calls with a 307 redirect to /login, which
        // surfaced as real "failed API/telemetry events" for anonymous
        // visitors (e.g. featureFlags.getAll) in the Superadmin Platform
        // Reliability notification. tRPC already enforces its own auth
        // boundary correctly: `protectedProcedure` (packages/rpc/src/trpc.ts)
        // throws UNAUTHORIZED unless `ctx.session.user` is set, and
        // `createContext` (packages/rpc/src/context.ts) independently verifies
        // the superadmin cookie or Supabase bearer token against the real Auth
        // API -- so this is not a case of removing real protection, just an
        // incorrect/redundant duplicate gate at the wrong layer. Rate limiting
        // and CORS/security headers in executeUnifiedPolicyMiddleware still
        // apply to every request regardless of this publicRoutes entry.
        '/api/trpc',
      ],
    });
    emitEnterpriseProxyTelemetry(request, { application: 'api', response, startedAt, event, sameOriginIngest: true });
    return response;
  }

  // Handle CORS for non-protected or custom routes
  const response = await executeUnifiedPolicyMiddleware(request, { appType: 'api' });
  emitEnterpriseProxyTelemetry(request, { application: 'api', response, startedAt, event, sameOriginIngest: true });
  return response;
}


export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login'
  ]
};
