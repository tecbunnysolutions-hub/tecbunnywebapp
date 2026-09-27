import { NextResponse, type NextRequest } from 'next/server';
import { executeUnifiedPolicyMiddleware } from '@tecbunny/core/auth/unified-middleware';
import { emitEnterpriseProxyTelemetry, type EnterpriseProxyEvent } from '@tecbunny/core/enterprise-analytics-proxy';

export async function proxy(request: NextRequest, event: EnterpriseProxyEvent) {
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
      // Entries match exactly; `*` is one path segment and `/**` a subtree.
      // Everything else requires a session, then the route's own guard.
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
        'POST /api/v1/auth/send-otp',
        'POST /api/v1/auth/verify-otp',
        'POST /api/auth/first-login-whatsapp',
        'GET /api/auth/2fa/status',
        'POST /api/auth/resend-verification',
        'POST /api/auth/resolve-phone',
        'POST /api/auth/quick-login',
        'POST /api/auth/extension',
        'POST /api/admin-auth/login',
        'POST /api/v1/admin-auth/login',
        'POST /api/payment/payu/callback',
        'POST /api/payment/payu/initiate',
        'POST /api/webhooks/orders/shipped',
        'POST /api/webhooks/orders/placed',
        'POST /api/webhooks/orders/outfordelivery',
        'POST /api/webhooks/orders/notconfirmed',
        'POST /api/webhooks/orders/delivered',
        'POST /api/webhooks/orders/delayed',
        'POST /api/webhooks/orders/cancelled',
        'POST /api/webhooks/payment/received',
        'POST /api/webhooks/payment/failed',
        'POST /api/webhooks/customer/signup',
        'GET /api/webhook/whatsapp',
        'POST /api/webhook/whatsapp',
        'GET /api/health',
        'GET /api/health/summary',
        'GET /api/health/otp',
        'GET /api/health/email',
        'GET /api/settings',
        'GET /api/metadata',
        'GET /api/page-content',
        'GET /api/auto-offers',
        'GET /api/offers',
        'GET /api/coupons',
        'GET /api/products',
        'GET /api/products/*',
        'GET /api/projects/**',
        'POST /api/checkout/calculate',
        'POST /api/cart/sync',
        'GET /api/orders',
        'POST /api/orders',
        'POST /api/analytics/track',
        'GET /api/captcha/config',
        'POST /api/captcha/verify',
        'POST /api/contact-messages',
        'POST /api/contact-messages-with-file',
        'GET /api/free-installation-slots',
        'GET /api/custom-setup-offers',
        'GET /api/docs',
        'GET /api/docs/openapi',
        'GET /api/v2/status',
        'POST /api/promotions/claim-viral',
        'POST /api/promotions/free-installation-claim',
        'POST /api/ai/research',
        'GET /api/ai/research',
        'POST /api/quotes',
        'POST /api/quotes/bid',
        // Customer quote links carry a signed action token checked by each handler.
        'GET /api/quotes/*',
        'POST /api/quotes/*/accept-counter',
        'POST /api/quotes/*/reject-counter',
        'GET /api/quotes/*/advance-payment/confirm',
        'POST /api/quotes/*/advance-payment/confirm',
        'POST /api/quotes/*/advance-payment/generate-link',
        'POST /api/uploads/quote-documents',
        'GET /api/v1/embed/configurator',
        // Server-to-server endpoints; each handler verifies its shared secret.
        'POST /api/marketing/triggers/order-delivered-followup',
        'POST /api/notifications/send',
        'POST /api/customer/notifications',
        'GET /api/cron/*',
        'POST /api/indexnow',
        'POST /api/email/abandoned-cart',
        // The tRPC catch-all (/api/trpc/[trpc]) hosts a mix of public and
        // protected procedures, and httpBatchLink can batch several procedure
        // names into one comma-joined path, so this gateway cannot tell them
        // apart. tRPC enforces its own boundary: `protectedProcedure` and
        // `adminProcedure` (packages/rpc/src/trpc.ts) require a verified
        // session, AAL2 for privileged roles and, for admin procedures, an
        // admin role. Rate limiting and security headers still apply here.
        '/api/trpc/**',
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
