import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requireSupabasePublicEnv } from './env';
export * from './env';
export * from './types';
import { isAtLeast, normalizeRole, type UserRole } from '@tecbunny/core/roles';

export interface RoleCheckOptions {
  allowedRoles?: UserRole[];
  minimumRole?: UserRole;
}

const roleMatches = (role: UserRole, options: RoleCheckOptions): boolean => {
  if (options.allowedRoles?.includes(role)) return true;
  if (options.minimumRole && isAtLeast(role, options.minimumRole)) return true;
  return !options.allowedRoles && !options.minimumRole;
};

type SuperadminSessionPayload = {
  sub: 'superadmin-root-id';
  email: string;
  iat: number;
  exp: number;
  jti: string;
  fp: string;
};

const textEncoder = new TextEncoder();
let cachedKeySecret: string | null = null;
let cachedCryptoKey: CryptoKey | null = null;

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacSha256(data: string, secret: string) {
  if (!cachedCryptoKey || cachedKeySecret !== secret) {
    cachedCryptoKey = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    cachedKeySecret = secret;
  }
  return new Uint8Array(await crypto.subtle.sign('HMAC', cachedCryptoKey, textEncoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

async function generateFingerprint(request: NextRequest): Promise<string> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const rawFp = `${ip.split(',')[0].trim()}|${ua}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', textEncoder.encode(rawFp));
  return base64UrlEncode(new Uint8Array(hashBuffer)).substring(0, 16);
}

async function verifySuperadminSessionTokenForMiddleware(token: string | undefined | null, request: NextRequest) {
  if (!token) return null;

  const secret = process.env.SUPERADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
  if (!secret) return null;

  const [version, encodedPayload, encodedSignature] = token.split('.');
  if ((version !== 'v1' && version !== 'v2') || !encodedPayload || !encodedSignature) return null;

  const expectedSignature = await hmacSha256(encodedPayload, secret);
  let actualSignature: Uint8Array;
  try {
    actualSignature = base64UrlDecode(encodedSignature);
  } catch {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, actualSignature)) return null;

  try {
    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<SuperadminSessionPayload>;
    const configuredEmail = process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.sub !== 'superadmin-root-id' ||
      !payload.email ||
      payload.email !== configuredEmail ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now
    ) {
      return null;
    }

    if (version === 'v2' && payload.fp !== await generateFingerprint(request)) return null;

    return payload as SuperadminSessionPayload;
  } catch {
    return null;
  }
}

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
    requestHeaders?: Headers;
    onUnauthorized?: (req: NextRequest) => NextResponse;
    onForbidden?: (req: NextRequest) => NextResponse;
    onMfaRequired?: (req: NextRequest) => NextResponse;
  }
) {
  const forwardedHeaders = options?.requestHeaders ?? request.headers;
  let response = NextResponse.next({
    request: { headers: forwardedHeaders },
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
          request: { headers: forwardedHeaders },
        });
        response.cookies.set({ name, value, ...cookieOptions });
      },
      remove(name: string, cookieOptions: CookieOptions) {
        request.cookies.set({ name, value: '', ...cookieOptions });
        response = NextResponse.next({
          request: { headers: forwardedHeaders },
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
    const superadminPayload = await verifySuperadminSessionTokenForMiddleware(superadminToken, request);
    
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

  // Extract role strictly from app_metadata (secure). Do not fallback to user_metadata which is client-modifiable.
  const rawRole = user.app_metadata?.role;
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
