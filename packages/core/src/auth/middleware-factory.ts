import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifySuperadminSessionToken } from './superadmin-session';
import { requireSupabasePublicEnv } from '../supabase/env';
import { isAtLeast } from '../roles';
import { signUserRole, verifySignedUserRole } from './role-cache';
import { checkPathPrefix, validateCsrf } from './csrf';

export interface RouteGuard {
  path: string | RegExp;
  prefix?: boolean;
  allowedRoles?: string[];
  isSuperadminOnly?: boolean;
  requireAuth?: boolean;
  redirectUrl?: string;
  isApiRoute?: boolean;
}

export interface MiddlewareConfig {
  appName: string;
  enableCors?: boolean;
  allowedOrigins?: string[];
  enableCsrf?: boolean;
  csrfExemptPaths?: string[];
  publicRoutes?: Array<{ path: string | RegExp; methods?: string[]; prefix?: boolean }>;
  routeGuards?: RouteGuard[];
  generateCsp?: () => string;
  onUnauthorized?: (req: NextRequest, isApi: boolean) => NextResponse;
}

function safeBase64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

function isInternalApiRequest(request: NextRequest, pathname: string): boolean {
  if (!checkPathPrefix(pathname, '/api/free-installation-slots')) return false;
  const expected = process.env.INTERNAL_API_KEY || process.env.INTERNAL_API_TOKEN || process.env.CRON_SECRET;
  const provided = request.headers.get('x-internal-api-key') || request.headers.get('x-internal-api-token');
  return Boolean(expected && provided && provided === expected);
}

export function createMiddleware(config: MiddlewareConfig) {
  return async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const requestHeaders = new Headers(request.headers);
    const correlationId = requestHeaders.get('x-correlation-id') || crypto.randomUUID();
    const nonce = safeBase64Encode(crypto.randomUUID());
    requestHeaders.set('x-nonce', nonce);

    if (config.generateCsp) {
      requestHeaders.set('Content-Security-Policy', config.generateCsp());
    }

    let response = NextResponse.next({ request: { headers: requestHeaders } });

    // Handle CORS preflight
    if (config.enableCors) {
      const origin = request.headers.get('origin');
      if (request.method === 'OPTIONS') {
        const preflight = new NextResponse(null, { status: 200 });
        if (origin && config.allowedOrigins?.includes(origin)) {
          preflight.headers.set('Access-Control-Allow-Origin', origin);
        }
        preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        preflight.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        preflight.headers.set('Access-Control-Max-Age', '86400');
        return preflight;
      }
    }

    try {
      const isInternalApiCall = isInternalApiRequest(request, pathname);
      const secret = process.env.SUPERADMIN_SESSION_SECRET;

      // Check public routes
      let isPublicRoute = false;
      if (config.publicRoutes) {
        isPublicRoute = config.publicRoutes.some(route => {
          if (route.path instanceof RegExp) {
            return route.path.test(pathname) && (!route.methods || route.methods.includes(request.method));
          }
          const currentPath = pathname.toLowerCase();
          const routePath = route.path.toLowerCase();
          const pathAllowed = route.prefix
            ? currentPath === routePath || currentPath.startsWith(`${routePath}/`)
            : currentPath === routePath;
          return pathAllowed && (!route.methods || route.methods.includes(request.method));
        });
      }

      // Special Next.js internal / public static routes bypass auth
      if (pathname.match(/^\/((?!_next\/static|_next\/image|favicon\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)/) === null) {
        isPublicRoute = true;
      }

      // CSRF
      if (config.enableCsrf) {
        const isCsrfValid = validateCsrf(request, isInternalApiCall, config.csrfExemptPaths || []);
        if (!isCsrfValid) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden', message: 'CSRF validation failed.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Superadmin Session
      const superadminCookie = request.cookies.get('superadmin-session')?.value;
      const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

      // UTM Parsing
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
          response.cookies.set('tb_source_context', safeBase64Encode(JSON.stringify(sourceContext)), {
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
        } catch {}
      }

      const finalizeResponse = (res: NextResponse) => {
        if (res !== response) {
          response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
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

        if (request.method === 'POST' && lowerPath.endsWith('/logout')) {
          res.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
        }

        if (config.enableCors) {
          const origin = request.headers.get('origin');
          if (origin && config.allowedOrigins?.includes(origin)) {
            res.headers.set('Access-Control-Allow-Origin', origin);
            res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
          }
        }

        res.headers.set('X-Frame-Options', 'DENY');
        res.headers.set('X-Content-Type-Options', 'nosniff');
        res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        if (config.generateCsp) res.headers.set('Content-Security-Policy', config.generateCsp());
        res.headers.set('X-Correlation-Id', correlationId);

        return res;
      };

      // M2M API auth handling for api app
      const authHeader = request.headers.get('authorization');
      const isM2MAuth = authHeader === `Bearer ${process.env.INTERNAL_SERVICE_KEY}`;
      if (isM2MAuth || isInternalApiCall) {
        return finalizeResponse(response);
      }

      let user = null;
      let userRole: string | null = null;
      let supabasePublicEnv: ReturnType<typeof requireSupabasePublicEnv> | null = null;

      try {
        supabasePublicEnv = requireSupabasePublicEnv();
      } catch {}

      if (supabasePublicEnv && !isPublicRoute) {
        try {
          const supabase = createServerClient(
            supabasePublicEnv.url,
            supabasePublicEnv.publicKey,
            {
              cookies: {
                get(name: string) {
                  return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                  request.cookies.set({ name, value, ...options });
                  response = NextResponse.next({ request: { headers: requestHeaders } });
                  response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                  request.cookies.set({ name, value: '', ...options });
                  response = NextResponse.next({ request: { headers: requestHeaders } });
                  response.cookies.set({ name, value: '', ...options });
                },
              },
            }
          );

          const { data } = await supabase.auth.getUser();
          user = data.user;

          if (user) {
            const rawRole = user.app_metadata?.role || user.user_metadata?.role;
            if (rawRole && typeof rawRole === 'string') userRole = rawRole.trim().toLowerCase();

            if (!userRole) {
              if (secret) {
                const roleCacheValue = request.cookies.get('tb-user-role-cache')?.value;
                const cachedRole = await verifySignedUserRole(roleCacheValue || '', user.id, secret);
                
                if (cachedRole) {
                  userRole = cachedRole;
                } else {
                  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                  if (profile?.role) {
                    userRole = profile.role.trim().toLowerCase();
                    try {
                      const signedRole = await signUserRole(user.id, userRole!, secret);
                      response.cookies.set('tb-user-role-cache', signedRole, {
                        maxAge: 300,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production'
                      });
                    } catch {}
                  }
                }
              }
            }

            if (userRole === 'superadmin' || userRole === 'super-admin' || userRole === 'super admin') {
              userRole = 'customer';
            }
          }
        } catch {}
      }

      // Apply Route Guards
      if (config.routeGuards) {
        for (const guard of config.routeGuards) {
          const isMatch = guard.path instanceof RegExp 
            ? guard.path.test(pathname) 
            : checkPathPrefix(pathname, guard.path);

          if (isMatch) {
            if (guard.isSuperadminOnly && !isSuperadmin) {
              if (config.onUnauthorized) return config.onUnauthorized(request, !!guard.isApiRoute);
              if (guard.isApiRoute) {
                return finalizeResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
              }
              const loginUrl = new URL(guard.redirectUrl || '/login', request.url);
              loginUrl.searchParams.set('next', pathname);
              return finalizeResponse(NextResponse.redirect(loginUrl));
            }

            if (guard.requireAuth && !user && !isSuperadmin) {
              if (config.onUnauthorized) return config.onUnauthorized(request, !!guard.isApiRoute);
              if (guard.isApiRoute) {
                return finalizeResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
              }
              const loginUrl = new URL(guard.redirectUrl || '/login', request.url);
              loginUrl.searchParams.set('next', pathname);
              return finalizeResponse(NextResponse.redirect(loginUrl));
            }

            if (guard.allowedRoles && guard.allowedRoles.length > 0 && !isSuperadmin) {
              const hasRole = userRole && guard.allowedRoles.some(r => {
                if (r === 'admin' || r === 'manager' || r === 'sales' || r === 'service_manager') {
                   // Evaluate hierarchical roles
                   return isAtLeast(userRole as any, r as any);
                }
                return userRole === r;
              });

              if (!hasRole) {
                if (guard.isApiRoute) {
                  return finalizeResponse(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
                }
                // Redirect if configured, otherwise 403
                if (guard.redirectUrl) {
                   return finalizeResponse(NextResponse.redirect(new URL(guard.redirectUrl, request.url)));
                }
                return finalizeResponse(new NextResponse('Forbidden', { status: 403 }));
              }
            }
          }
        }
      }

      return finalizeResponse(response);

    } catch (globalError) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'middleware.fatal_exception',
        error: globalError instanceof Error ? globalError.message : globalError,
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
  };
}
