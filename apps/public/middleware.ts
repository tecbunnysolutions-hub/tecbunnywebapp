import { createMiddleware } from '@tecbunny/core/auth/middleware-factory';

function generateCSP() {
  const scriptSrc = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://cs.iubenda.com https://cdn.iubenda.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://connect.facebook.net";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.analytics.google.com https://analytics.google.com https://www.google.com https://api.postalpincode.in https://cloudflareinsights.com https://static.cloudflareinsights.com https://challenges.cloudflare.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://secure.payu.in https://test.payu.in",
    "frame-ancestors 'none'",
  ].join('; ');
}

export const middleware = createMiddleware({
  appName: 'public',
  enableCsrf: true,
  generateCsp: generateCSP,
  csrfExemptPaths: [
    '/api/payment/payu/callback',
    '/api/webhooks',
    '/api/webhooks/whatsapp',
    '/api/products/scraper'
  ],
  publicRoutes: [
    { path: '/api/auth', prefix: true },
    { path: '/api/health', prefix: true },
    { path: '/api/superadmin/login' },
    { path: '/api/settings', methods: ['GET'] },
    { path: '/api/metadata', methods: ['GET'] },
    { path: '/api/page-content', methods: ['GET'] },
    { path: '/api/auto-offers', methods: ['GET'] },
    { path: '/api/offers', methods: ['GET'] },
    { path: '/api/coupons', methods: ['GET'] },
    { path: '/api/products', methods: ['GET'] },
    { path: '/api/products/scraper', methods: ['POST', 'OPTIONS'], prefix: true },
    { path: '/api/projects', methods: ['GET'], prefix: true },
    { path: '/api/checkout/calculate', methods: ['POST'] },
    { path: '/api/analytics/track', methods: ['POST'] },
    { path: '/api/captcha', prefix: true },
    { path: '/api/payment/payu/callback', methods: ['POST'] },
    { path: '/api/contact-messages', methods: ['POST'] },
    { path: '/api/free-installation-slots', methods: ['GET'] },
    { path: '/api/promotions/claim-viral', methods: ['POST'] },
    { path: '/api/promotions/free-installation-claim', methods: ['POST'] },
    { path: '/api/warranty/activate', methods: ['POST'] },
    { path: '/api/quotes/bid', methods: ['POST'] },
    { path: '/api/uploads/quote-documents', methods: ['POST'] },
    { path: '/api/ai/research', methods: ['POST'] },
    { path: '/api/webhooks/whatsapp', methods: ['GET', 'POST'] },
    // Public Regex routes
    { path: /^\/api\/quotes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\/(accept-counter|reject-counter|advance-payment\/confirm|advance-payment\/generate-link))?$/i },
    { path: '/api/admin/quotes/advance-payment', methods: ['GET'] },
    { path: '/api/products/recommendations', methods: ['GET'] },
    // A simplified public product view bypass (if not protected subroute)
    { path: /^\/api\/products\/((?!(bulk-edit|cleanup|cleanup-images|export|fix-images|image-diagnostics|import|manual-import|simple-import|template)$)[^/]+)$/i, methods: ['GET'] },
  ],
  routeGuards: [
    // Superadmin
    { path: '/superadmin', isSuperadminOnly: true, prefix: true },
    { path: '/api/superadmin', isSuperadminOnly: true, prefix: true, isApiRoute: true },
    // API Hierarchical
    { path: '/api/admin', allowedRoles: ['admin'], isApiRoute: true },
    { path: '/api/manager', allowedRoles: ['manager'], isApiRoute: true },
    { path: '/api/sales-staff', allowedRoles: ['sales'], isApiRoute: true },
    { path: '/api/sales-external', allowedRoles: ['sales-external', 'sales_agent'], isApiRoute: true },
    { path: '/api/service-manager', allowedRoles: ['service_manager'], isApiRoute: true },
    { path: '/api', requireAuth: true, isApiRoute: true },
    // Mgmt Frontend
    { path: '/mgmt/admin', allowedRoles: ['admin'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/manager', allowedRoles: ['manager', 'sales_manager'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/sales-staff', allowedRoles: ['sales-staff', 'sales', 'store_executive', 'sales_executive'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/sales-external', allowedRoles: ['sales-external', 'sales_agent'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/sales', allowedRoles: ['sales', 'sales_executive'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/service-manager', allowedRoles: ['service_manager'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/service-engineer', allowedRoles: ['service_engineer'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt/accounts', allowedRoles: ['accounts'], redirectUrl: '/mgmt/dashboard', prefix: true },
    { path: '/mgmt', allowedRoles: ['admin', 'manager', 'sales', 'sales-staff', 'sales-external', 'service_engineer', 'accounts', 'sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'sales_agent'], redirectUrl: '/staff/login' },
  ]
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
