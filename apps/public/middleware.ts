import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session'
import { requireSupabasePublicEnv } from '@tecbunny/core/supabase/env'
import { isAtLeast } from '@tecbunny/core/roles'

// Helper to generate the CSP without strict nonce (to allow Next.js static pages to hydrate)
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

// Global Cache for HMAC key used in Role Cache Signing (prevents GC thrashing)
let cachedRoleKey: CryptoKey | null = null;
let cachedRoleSecret: string | null = null;
const textEncoder = new TextEncoder();

async function getRoleKey(secret: string): Promise<CryptoKey> {
  if (cachedRoleKey && cachedRoleSecret === secret) return cachedRoleKey;
  cachedRoleKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  cachedRoleSecret = secret;
  return cachedRoleKey;
}

// Signs the user role to create a tamper-proof transient session cache cookie
async function signUserRole(userId: string, role: string, secret: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5-minute expiration
  const data = `${userId}:${role}:${expiresAt}`;
  const key = await getRoleKey(secret);
  const signatureBytes = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
  const signatureHex = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${data}.${signatureHex}`;
}

// Verifies the tamper-proof role signature cookie
async function verifySignedUserRole(cookieValue: string, userId: string, secret: string): Promise<string | null> {
  try {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return null;
    const [data, signatureHex] = parts;
    const dataParts = data.split(':');
    if (dataParts.length !== 3) return null;
    const [cookieUserId, role, expiresAtStr] = dataParts;

    if (cookieUserId !== userId) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;

    const key = await getRoleKey(secret);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
    const expectedSignatureHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signatureHex === expectedSignatureHex ? role : null;
  } catch {
    return null;
  }
}

// Safe Base64 encoding supporting Unicode characters (prevents btoa crashes)
function safeBase64Encode(str: string): string {
  const bytes = textEncoder.encode(str);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

// Case-insensitive, boundary-aware path checking to prevent path-traversal/casing bypasses
function checkPathPrefix(pathname: string, prefix: string): boolean {
  const path = pathname.toLowerCase();
  const pref = prefix.toLowerCase();
  return path === pref || path.startsWith(pref + '/');
}

function isInternalApiRequest(request: NextRequest, pathname: string): boolean {
  if (!checkPathPrefix(pathname, '/api/free-installation-slots')) {
    return false;
  }

  const expected = process.env.INTERNAL_API_KEY || process.env.INTERNAL_API_TOKEN || process.env.CRON_SECRET;
  const provided = request.headers.get('x-internal-api-key') || request.headers.get('x-internal-api-token');
  return Boolean(expected && provided && provided === expected);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  const correlationId = requestHeaders.get('x-correlation-id') || crypto.randomUUID();
  const nonce = safeBase64Encode(crypto.randomUUID());
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', generateCSP());

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  try {
    const isInternalApiCall = isInternalApiRequest(request, pathname);
    const secret = process.env.SUPERADMIN_SESSION_SECRET;
    if (!secret) {
      console.warn('CRITICAL WARNING: SUPERADMIN_SESSION_SECRET is missing. Role caching will be disabled.');
    }

    // Define public API routes that don't require authentication
    const publicApiRoutes: Array<{ path: string; methods?: string[]; prefix?: boolean }> = [
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
    ];

    let isPublicApiRoute = publicApiRoutes.some(route => {
      const routePath = route.path.toLowerCase();
      const currentPath = pathname.toLowerCase();
      const methodAllowed = !route.methods || route.methods.includes(request.method);
      const pathAllowed = route.prefix
        ? currentPath === routePath || currentPath.startsWith(`${routePath}/`)
        : currentPath === routePath;

      return methodAllowed && pathAllowed;
    });

    const quoteUuidRegex = /^\/api\/quotes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\/(accept-counter|reject-counter|advance-payment\/confirm|advance-payment\/generate-link))?$/i;
    const isPublicQuoteRoute = quoteUuidRegex.test(pathname);
    const isPublicAdminAdvancePayment = pathname === '/api/admin/quotes/advance-payment' && request.method === 'GET';
    const productSubroute = pathname.match(/^\/api\/products\/([^/]+)$/i)?.[1]?.toLowerCase();
    const protectedProductSubroutes = new Set([
      'bulk-edit',
      'cleanup',
      'cleanup-images',
      'export',
      'fix-images',
      'image-diagnostics',
      'import',
      'manual-import',
      'simple-import',
      'template',
    ]);
    const isPublicProductDetailRoute =
      request.method === 'GET' &&
      typeof productSubroute === 'string' &&
      !protectedProductSubroutes.has(productSubroute);
    const isPublicProductRecommendationRoute =
      request.method === 'GET' &&
      pathname.toLowerCase() === '/api/products/recommendations';

    if (isPublicQuoteRoute || isPublicAdminAdvancePayment || isPublicProductDetailRoute || isPublicProductRecommendationRoute) {
      isPublicApiRoute = true;
    }

    // CSRF Protection for mutating state-change actions on authenticated APIs
    const isMutatingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    if (isMutatingMethod && checkPathPrefix(pathname, '/api')) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const targetOrigin = request.nextUrl.origin;

      let isSameOrigin = false;
      if (origin) {
        isSameOrigin = origin === targetOrigin;
      } else if (referer) {
        try {
          isSameOrigin = new URL(referer).origin === targetOrigin;
        } catch {
          isSameOrigin = false;
        }
      }

      const secFetchSite = request.headers.get('sec-fetch-site');
      if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
        isSameOrigin = false;
      }

      const isCsrfExempt =
        isInternalApiCall ||
        checkPathPrefix(pathname, '/api/payment/payu/callback') ||
        checkPathPrefix(pathname, '/api/webhooks') ||
        checkPathPrefix(pathname, '/api/webhooks/whatsapp') ||
        checkPathPrefix(pathname, '/api/products/scraper');

      if (!isCsrfExempt && !isSameOrigin) {
        console.warn('CSRF Blocked Request:', { pathname, correlationId, origin, referer });
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'CSRF validation failed.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify Superadmin claim (with cached HMAC validation optimized inside verifySuperadminSessionToken)
    const superadminCookie = request.cookies.get('superadmin-session')?.value;
    const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

    // Parse incoming business-tier variables and write state cookie using Unicode-safe encoder
    const utmSource = request.nextUrl.searchParams.get('utm_source');
    const referralId = request.nextUrl.searchParams.get('ref');
    const platformFlag = request.nextUrl.searchParams.get('source_platform');

    if (utmSource || referralId || platformFlag) {
      try {
        const sourceContext = {
          source: utmSource || 'organic',
          ref: referralId || null,
          platform: platformFlag || 'web',
          timestamp: Date.now()
        };
        const contextValue = safeBase64Encode(JSON.stringify(sourceContext));
        response.cookies.set('tb_source_context', contextValue, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
      } catch (err) {
        console.error('Failed to encode UTM parameters safely:', err);
      }
    }

    const finalizeResponse = (res: NextResponse) => {
      if (res !== response) {
        response.cookies.getAll().forEach((cookie) => {
          res.cookies.set(cookie);
        });
      }

      const lowerPath = pathname.toLowerCase();
      const isSensitivePath = 
        lowerPath.startsWith('/mgmt') ||
        lowerPath.startsWith('/auth') ||
        lowerPath.startsWith('/checkout') ||
        lowerPath.startsWith('/cart') ||
        lowerPath.startsWith('/profile') ||
        lowerPath.startsWith('/superadmin') ||
        lowerPath.startsWith('/api/superadmin');

      if (isSensitivePath) {
        res.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        res.headers.set('Pragma', 'no-cache');
        res.headers.set('Expires', '0');
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      }

      // Add Clear-Site-Data only on intentional logout mutations.
      if (request.method === 'POST' && lowerPath.endsWith('/logout')) {
        res.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
      }

      res.headers.set('X-Frame-Options', 'DENY');
      res.headers.set('X-Content-Type-Options', 'nosniff');
      res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.headers.set('Content-Security-Policy', generateCSP());
      res.headers.set('X-Correlation-Id', correlationId);

      return res;
    };

    if (isSuperadmin) {
      if (
        checkPathPrefix(pathname, '/profile') ||
        checkPathPrefix(pathname, '/cart') ||
        checkPathPrefix(pathname, '/checkout') ||
        checkPathPrefix(pathname, '/mgmt')
      ) {
        return finalizeResponse(NextResponse.redirect(new URL('/superadmin/mgmt/dashboard', request.url)));
      }
    }

    let user = null;
    let userRole: string | null = null;

    let supabasePublicEnv: ReturnType<typeof requireSupabasePublicEnv> | null = null;

    try {
      supabasePublicEnv = requireSupabasePublicEnv();
    } catch (envError) {
      console.error('Middleware Supabase configuration error:', envError);
    }

    if (supabasePublicEnv) {
      try {
        const supabase = createServerClient(
          supabasePublicEnv.url,
          supabasePublicEnv.publicKey,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                // Ensure request cookies are updated so downstream Server Components see the refreshed token
                cookiesToSet.forEach(({ name, value }) => {
                  request.cookies.set(name, value);
                });
                
                // Re-initialize response with updated request to prevent desync
                response = NextResponse.next({ request: { headers: requestHeaders } });
                
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, {
                    ...options,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                  });
                });
              },
            },
          }
        );

        const { data } = await supabase.auth.getUser();
        user = data.user;

        if (user) {
          // Resolve role from app_metadata first
          const rawRole = user.app_metadata?.role;
          if (rawRole && typeof rawRole === 'string') {
            userRole = rawRole.trim().toLowerCase();
          }

          // Caching: check cookie signature to avoid querying relational database profiles on every request
          const needsRoleLookup = !userRole || checkPathPrefix(pathname, '/mgmt') || checkPathPrefix(pathname, '/api/mgmt');
          if (needsRoleLookup) {
            if (secret) {
              const roleCacheValue = request.cookies.get('tb-user-role-cache')?.value;
              const cachedRole = await verifySignedUserRole(roleCacheValue || '', user.id, secret);

              if (cachedRole) {
                userRole = cachedRole;
              } else {
                // Cache miss / expired: query DB profile once and write signature
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', user.id)
                  .single();

                if (profile?.role && typeof profile.role === 'string') {
                  userRole = profile.role.trim().toLowerCase();
                  try {
                    const signedRole = await signUserRole(user.id, userRole, secret);
                    response.cookies.set('tb-user-role-cache', signedRole, {
                      maxAge: 300, // 5 minute TTL cache
                      path: '/',
                      sameSite: 'lax',
                      secure: process.env.NODE_ENV === 'production'
                    });
                  } catch (cookieErr) {
                    console.error('Failed to set signed role cookie cache:', cookieErr);
                  }
                }
              }
            } else {
              // Graceful degradation when secret is missing: perform raw DB lookup without caching
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

              if (profile?.role && typeof profile.role === 'string') {
                userRole = profile.role.trim().toLowerCase();
              }
            }
          }

          // Strip superadmin privileges from Supabase relational database profiles
          if (userRole === 'superadmin' || userRole === 'super-admin' || userRole === 'super admin') {
            userRole = 'customer';
          }
        }
      } catch (e) {
        console.error('Middleware Supabase Error:', e);
        // Do not return 503. Just assume unauthenticated.
        user = null;
        userRole = null;
      }
    }

    // Superadmin boundary validation
    if (checkPathPrefix(pathname, '/superadmin') || checkPathPrefix(pathname, '/api/superadmin')) {
      const isLoginRoute = pathname === '/superadmin/login' || pathname === '/api/superadmin/login';
      const isLogoutRoute = pathname === '/api/superadmin/logout';
      if (!isLoginRoute && !isLogoutRoute && !isSuperadmin) {
        if (pathname.startsWith('/api/')) {
          return finalizeResponse(NextResponse.json(
            { error: 'Unauthorized', message: 'Superadmin session is missing or expired.' },
            { status: 401 }
          ));
        }
        const loginUrl = new URL('/superadmin/login', request.url);
        loginUrl.searchParams.set('error', 'session_expired');
        loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
        return finalizeResponse(NextResponse.redirect(loginUrl));
      }
    }

    // API Route Guards for each Role Tier
    if (checkPathPrefix(pathname, '/api')) {
      if (isInternalApiCall) {
        return finalizeResponse(response);
      }

      if (!isPublicApiRoute && !user && !isSuperadmin) {
        return finalizeResponse(NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required for this endpoint' },
          { status: 401 }
        ));
      }

      if (checkPathPrefix(pathname, '/api/admin') && !isPublicApiRoute && !isAtLeast(userRole as any, 'admin') && !isSuperadmin) {
        return finalizeResponse(NextResponse.json({ error: 'Not Found' }, { status: 404 }));
      }
      if (checkPathPrefix(pathname, '/api/manager') && !isAtLeast(userRole as any, 'manager') && !isSuperadmin) {
        return finalizeResponse(NextResponse.json({ error: 'Not Found' }, { status: 404 }));
      }
      if (checkPathPrefix(pathname, '/api/sales-staff') && !isAtLeast(userRole as any, 'sales') && !isSuperadmin) {
        return finalizeResponse(NextResponse.json({ error: 'Not Found' }, { status: 404 }));
      }
      if (
        checkPathPrefix(pathname, '/api/sales-external')
        && userRole !== 'sales-external'
        && userRole !== 'sales_agent'
        && !isSuperadmin
      ) {
        return finalizeResponse(NextResponse.json({ error: 'Not Found' }, { status: 404 }));
      }
      if (checkPathPrefix(pathname, '/api/service-manager') && !isAtLeast(userRole as any, 'service_manager') && !isSuperadmin) {
        return finalizeResponse(NextResponse.json({ error: 'Not Found' }, { status: 404 }));
      }
    }

    // Protect Management Interface
    if (checkPathPrefix(pathname, '/mgmt')) {
      if (!user) {
        const loginUrl = new URL('/staff/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return finalizeResponse(NextResponse.redirect(loginUrl));
      }

      const STAFF_ROLES = new Set([
        'admin', 'manager', 'sales', 'sales-staff', 'sales-external', 'service_engineer', 'accounts',
        'sales_manager', 'service_manager', 'sales_executive', 'store_executive', 'sales_agent',
      ]);
      if (!userRole || !STAFF_ROLES.has(userRole)) {
        return finalizeResponse(new NextResponse('Forbidden', { status: 403 }));
      }

      // Role path segregation & folder group checks
      if (checkPathPrefix(pathname, '/mgmt/admin')) {
        if (userRole !== 'admin') {
          return finalizeResponse(NextResponse.redirect(new URL('/mgmt/dashboard', request.url)));
        }

        const allowedAdminPaths = [
          '/mgmt/admin',
          '/mgmt/admin/staff',
          '/mgmt/admin/inventory',
          '/mgmt/admin/products',
          '/mgmt/admin/orders',
          '/mgmt/admin/purchase',
          '/mgmt/admin/invoice-lookup',
          '/mgmt/admin/quotes',
          '/mgmt/admin/broadcast-desk',
        ];
        const isAllowed = allowedAdminPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
        if (!isAllowed) {
          return finalizeResponse(NextResponse.redirect(new URL('/mgmt/dashboard', request.url)));
        }
      }

      if (
        checkPathPrefix(pathname, '/mgmt/manager')
        && userRole !== 'manager'
        && userRole !== 'sales_manager'
      ) {
        return finalizeResponse(NextResponse.redirect(new URL('/mgmt/dashboard', request.url)));
      }
      if (
        checkPathPrefix(pathname, '/mgmt/sales-staff')
        && userRole !== 'sales-staff'
        && userRole !== 'sales'
        && userRole !== 'store_executive'
        && userRole !== 'sales_executive'
      ) {
        return finalizeResponse(NextResponse.redirect(new URL('/mgmt/dashboard', request.url)));
      }
      if (
        checkPathPrefix(pathname, '/mgmt/sales-external')
        && userRole !== 'sales-external'
        && userRole !== 'sales_agent'
      ) {
        return finalizeResponse(NextResponse.redirect(new URL('/mgmt/dashboard', request.url)));
      }
      if (
        checkPathPrefix(pathname, '/mgmt/sales') &&
        !checkPathPrefix(pathname, '/mgmt/sales-staff') &&
        !checkPathPrefix(pathname, '/mgmt/sales-external')
      ) {
        if (userRole !== 'sales' && userRole !== 'sales_executive') {
          return finalizeResponse(new NextResponse('Not Found', { status: 404 }));
        }
      }
      if (checkPathPrefix(pathname, '/mgmt/service-manager') && userRole !== 'service_manager') {
        return finalizeResponse(new NextResponse('Not Found', { status: 404 }));
      }
      if (checkPathPrefix(pathname, '/mgmt/service-engineer') && userRole !== 'service_engineer') {
        return finalizeResponse(new NextResponse('Not Found', { status: 404 }));
      }
      if (checkPathPrefix(pathname, '/mgmt/accounts') && userRole !== 'accounts') {
        return finalizeResponse(new NextResponse('Not Found', { status: 404 }));
      }
    }

    return finalizeResponse(response);

  } catch (globalError) {
    // Fail-safe global error recovery to prevent site outage in case of middleware crashes
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'middleware.fatal_exception',
      error: globalError instanceof Error ? globalError.message : globalError,
      stack: globalError instanceof Error ? globalError.stack : undefined,
      correlationId
    }));

    const failSafeRes = NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected request handling exception occurred.' },
      { status: 500 }
    );
    failSafeRes.headers.set('X-Correlation-Id', correlationId);
    failSafeRes.headers.set('X-Frame-Options', 'DENY');
    failSafeRes.headers.set('X-Content-Type-Options', 'nosniff');
    return failSafeRes;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
