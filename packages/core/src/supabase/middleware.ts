import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requireSupabasePublicEnv } from './env';
import { normalizeRole, type UserRole } from '../roles';
import { roleMatches, type RoleCheckOptions } from '../server-role-guard';

/**
 * Shared middleware for verifying Supabase Auth sessions and enforcing Role-Based Access Control (RBAC).
 * Replaces disparate auth/middleware logic across apps (api, mgmt, superadmin, waba).
 */
export async function updateSession(
  request: NextRequest,
  options?: RoleCheckOptions & { 
    publicRoutes?: string[]; 
    loginRoute?: string;
    enforceMfaRoles?: string[];
    onUnauthorized?: (req: NextRequest) => NextResponse;
    onForbidden?: (req: NextRequest) => NextResponse;
    onMfaRequired?: (req: NextRequest) => NextResponse;
  }
) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { url, publicKey } = requireSupabasePublicEnv();

  const supabase = createServerClient(url, publicKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, cookieOptions: CookieOptions) {
        request.cookies.set({ name, value, ...cookieOptions });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...cookieOptions });
      },
      remove(name: string, cookieOptions: CookieOptions) {
        request.cookies.set({ name, value: '', ...cookieOptions });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...cookieOptions });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  if (options?.publicRoutes?.some((route: string) => pathname.startsWith(route))) {
    return response;
  }

  // Allow auth callback or login route
  const loginRoute = options?.loginRoute || '/auth/login';
  if (pathname.startsWith(loginRoute) || pathname.startsWith('/auth/callback')) {
    return response;
  }

  // Check for Custom Superadmin Token (via Header OR Cookie)
  const authHeader = request.headers.get('authorization');
  const superadminCookie = request.cookies.get('superadmin-session')?.value;
  let superadminToken = superadminCookie;
  
  if (!superadminToken && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('v1.') || token.startsWith('v2.')) {
      superadminToken = token;
    }
  }

  if (superadminToken) {
    const { verifySuperadminSessionToken } = await import('../auth/superadmin-session');
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const superadminPayload = await verifySuperadminSessionToken(superadminToken, ip, ua);
    
    if (superadminPayload) {
      // Token is a valid Superadmin session. Inject role and bypass Supabase Auth check.
      const userRole: UserRole = 'superadmin';
      
      if (options && (options.allowedRoles || options.minimumRole)) {
        if (!roleMatches(userRole, { allowedRoles: options.allowedRoles, minimumRole: options.minimumRole })) {
          if (options?.onForbidden) return options.onForbidden(request);
          return new NextResponse(`Forbidden: Insufficient Privileges. Role '${userRole}' is not authorized.`, { status: 403 });
        }
      }
      
      return response; // Authorize the request
    }
  }

  // IMPORTANT: Avoid using getSession() due to security risks. getUser() verifies the token with the Supabase API.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    if (options?.onUnauthorized) {
      return options.onUnauthorized(request);
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = loginRoute;
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Extract role primarily from app_metadata (secure) and fallback to user_metadata (less secure, depends on app design)
  // This logic mimics the robust server-role-guard.ts extraction.
  const rawRole = user.app_metadata?.role || user.user_metadata?.role;
  const userRole = normalizeRole(rawRole);

  if (!userRole) {
    if (options?.onForbidden) return options.onForbidden(request);
    return new NextResponse('Forbidden: Role not assigned', { status: 403 });
  }

  // Verify Role Restrictions
  if (options && (options.allowedRoles || options.minimumRole)) {
    if (!roleMatches(userRole, { allowedRoles: options.allowedRoles, minimumRole: options.minimumRole })) {
      if (options?.onForbidden) return options.onForbidden(request);
      return new NextResponse(`Forbidden: Insufficient Privileges. Role '${userRole}' is not authorized.`, { status: 403 });
    }
  }

  // Enforce MFA for specific roles
  if (options?.enforceMfaRoles && options.enforceMfaRoles.includes(userRole)) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel !== 'aal2') {
      if (options?.onMfaRequired) {
        return options.onMfaRequired(request);
      }
      return NextResponse.redirect(new URL('/mfa-setup', request.url));
    }
  }

  return response;
}
