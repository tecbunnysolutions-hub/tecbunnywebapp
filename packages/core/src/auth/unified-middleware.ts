import { NextResponse, type NextRequest } from 'next/server';
import {  updateSession  } from '@tecbunny/database/middleware';

export interface UnifiedMiddlewareOptions {
  appType: 'api' | 'public' | 'superadmin' | 'mgmt';
  publicRoutes?: string[];
  loginRoute?: string;
}

function generateCSP() {
  const scriptSrc = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://cs.iubenda.com https://cdn.iubenda.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://connect.facebook.net";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.analytics.google.com https://analytics.google.com https://www.google.com https://api.postalpincode.in https://cloudflareinsights.com https://static.cloudflareinsights.com https://challenges.cloudflare.com https://vitals.vercel-insights.com https://api.tecbunny.com",
    "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://secure.payu.in https://test.payu.in",
    "frame-ancestors 'none'",
  ].join('; ');
}

export async function executeUnifiedPolicyMiddleware(
  request: NextRequest,
  options: UnifiedMiddlewareOptions
) {
  const { appType, publicRoutes = [], loginRoute = '/login' } = options;
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  
  // Security Headers
  requestHeaders.set('Content-Security-Policy', generateCSP());
  requestHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  requestHeaders.set('X-Frame-Options', 'DENY');
  requestHeaders.set('X-Content-Type-Options', 'nosniff');
  requestHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  requestHeaders.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

  // Unified CORS Handling for API
  let allowedOrigin = 'null';
  const origin = request.headers.get('origin');
  if (appType === 'api') {
    // Strict CORS validation
    if (origin) {
      try {
        const url = new URL(origin);
        if (
          url.hostname === 'localhost' || 
          url.hostname === 'tecbunny.com' || 
          url.hostname.endsWith('.tecbunny.com')
        ) {
          allowedOrigin = origin;
        }
      } catch (e) {
        // Invalid origin format
      }
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
  }

  // Extract IP for rate limiting and logging
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Global Edge-compatible Rate Limiting (Isolate-level memory fallback)
  // Protects against volumetric abuse per edge instance
  const isGlobalRateLimited = (ip: string) => {
    const globalStore = (globalThis as any).__edgeRateLimit || new Map<string, {count: number, first: number}>();
    if (!(globalThis as any).__edgeRateLimit) (globalThis as any).__edgeRateLimit = globalStore;
    
    const now = Date.now();
    const windowMs = 60000;
    const limit = 1000; // 1000 req/min/ip per isolate
    
    const rec = globalStore.get(ip);
    if (!rec || now - rec.first > windowMs) {
      globalStore.set(ip, { count: 1, first: now });
      return false; // not limited
    }
    
    if (rec.count >= limit) return true; // limited
    rec.count += 1;
    return false;
  };

  if (isGlobalRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } });
  }

  // Defer to updateSession for token validation and role checking
  const sessionResponse = await updateSession(request, {
    allowedRoles: undefined, // Role enforcement is now handled by Prisma Extension and Route Guards
    loginRoute,
    publicRoutes,
    enforceMfaRoles: (appType === 'mgmt' || appType === 'superadmin') ? ['admin', 'superadmin'] : undefined,
    onUnauthorized: (req: NextRequest) => {
      // Instrument authorization failure (No Session)
      try {
        const { telemetry } = require('@tecbunny/core/telemetry');
        telemetry.getTracer().startActiveSpan('auth.failure', (span: any) => {
          span.setAttributes({
            'auth.failure_reason': 'No active session',
            'auth.attempted_resource': pathname,
          });
          span.setStatus({ code: 2, message: 'Unauthorized' });
          span.end();
        });
      } catch (e) {
        // Telemetry fallback in edge runtime
      }
      
      if (pathname.startsWith('/api')) {
         return NextResponse.json({ error: 'Unauthorized middleware' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(loginRoute, req.url));
    },
    onForbidden: (req: NextRequest) => {
      // Instrument authorization failure (Forbidden)
      try {
        const { telemetry } = require('@tecbunny/core/telemetry');
        telemetry.getTracer().startActiveSpan('auth.failure', (span: any) => {
          span.setAttributes({
            'auth.failure_reason': 'Insufficient Privileges',
            'auth.attempted_resource': pathname,
          });
          span.setStatus({ code: 2, message: 'Forbidden' });
          span.end();
        });
      } catch (e) {
        // Telemetry fallback in edge runtime
      }
      
      if (pathname.startsWith('/api')) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL(loginRoute, req.url));
    },
    onMfaRequired: (req: NextRequest) => {
      // Instrument MFA requirement
      try {
        const { telemetry } = require('@tecbunny/core/telemetry');
        telemetry.getTracer().startActiveSpan('auth.mfa_required', (span: any) => {
          span.setAttributes({
            'auth.attempted_resource': pathname,
          });
          span.setStatus({ code: 1, message: 'MFA Required' });
          span.end();
        });
      } catch (e) {}

      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'MFA Required' }, { status: 403 });
      }
      
      const mfaSetupUrl = new URL(appType === 'superadmin' ? '/superadmin/mfa-setup' : '/mfa-setup', req.url);
      mfaSetupUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(mfaSetupUrl);
    }
  });

  // Basic Mutation Audit Logging for API
  if (appType === 'api' && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
     try {
        const { logger } = require('@tecbunny/core/logger');
        // Extracting user info from cookies would require decoding JWT, 
        // relying on telemetry for now.
        logger.info('api_mutation_audit', { method: request.method, pathname, ip });
     } catch (e) {
        // Silent catch for logger missing
     }
  }

  // Apply security headers to the response
  sessionResponse.headers.set('Content-Security-Policy', generateCSP());
  sessionResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  sessionResponse.headers.set('X-Frame-Options', 'DENY');
  sessionResponse.headers.set('X-Content-Type-Options', 'nosniff');
  sessionResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  sessionResponse.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

  if (appType === 'api' && origin) {
    sessionResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    sessionResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    sessionResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    sessionResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // Parse UTM params if present
  const utmSource = request.nextUrl.searchParams.get('utm_source');
  if (utmSource) {
     sessionResponse.cookies.set('tb_source_context', btoa(JSON.stringify({ source: utmSource })), { path: '/' });
  }

  return sessionResponse;
}
