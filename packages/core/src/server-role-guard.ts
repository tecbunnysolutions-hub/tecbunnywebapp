import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { ALL_ROLES, hasPermission, isAtLeast, normalizeRole, permissionImplies, type UserRole } from './roles';
import { createServerClient } from '@tecbunny/database';

const DEFAULT_ROLE: UserRole = 'customer';
type NullableRole = UserRole | null;

const METADATA_ROLE_KEYS = ['role', 'default_role', 'app_role', 'user_role'] as const;
const METADATA_ROLE_ARRAY_KEYS = ['roles', 'app_roles'] as const;
const UNSAFE_METADATA_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  return !Object.keys(value).some((key) => UNSAFE_METADATA_KEYS.has(key));
};

const isCanonicalRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && (ALL_ROLES as readonly string[]).includes(value);
};

const extractRoleFromMetadata = (metadata: Record<string, unknown> | null | undefined): NullableRole => {
  if (!isPlainRecord(metadata)) {
    return null;
  }

  for (const key of METADATA_ROLE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(metadata, key) && isCanonicalRole(metadata[key])) {
      return metadata[key];
    }
  }

  for (const key of METADATA_ROLE_ARRAY_KEYS) {
    const value = metadata[key];
    if (Array.isArray(value) && value.every(isCanonicalRole)) {
      for (const entry of value) {
        return entry;
      }
    }
  }

  return null;
};

const fetchProfileRole = async (supabase: SupabaseClient, userId: string): Promise<NullableRole> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return normalizeRole(data?.role);
  } catch {
    return null;
  }
};

export interface RoleCheckOptions {
  allowedRoles?: UserRole[];
  minimumRole?: UserRole;
}

export interface ServerAuthState {
  supabase: SupabaseClient;
  session: Session | null;
  role: UserRole;
  permissions: string[];
  mfaLevel: string | null;
}

export async function getServerAuthState(): Promise<ServerAuthState> {
  try {
    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    const headersList = await headers();
    let superadminToken = cookieStore.get('superadmin-session')?.value;

    if (!superadminToken) {
      const authHeader = headersList.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token.startsWith('v1.') || token.startsWith('v2.')) {
          superadminToken = token;
        }
      }
    }

    let isSuperadmin = false;
    if (superadminToken) {
      try {
        const { verifySuperadminSessionToken } = await import('./auth/superadmin-session');
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const ua = headersList.get('user-agent') || 'unknown';
        
        isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminToken, ip, ua));
      } catch {
        // Ignored
      }
    }
    
    if (isSuperadmin) {
        const { createServiceClient, isSupabaseServiceConfigured } = await import('@tecbunny/database');
        const supabase = isSupabaseServiceConfigured ? createServiceClient() : await createServerClient();
        return {
          supabase,
          session: {
            access_token: 'superadmin-token-stub',
            refresh_token: 'superadmin-refresh-stub',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: 'superadmin-system-session',
              email: 'superadmin@tecbunny.com',
              app_metadata: { role: 'superadmin' },
              user_metadata: { name: 'Superadmin' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as any,
          },
          role: 'superadmin' as UserRole,
          permissions: ['*'],
          mfaLevel: 'aal2', // Assumed secure for legacy cookie stub
        };
      }
  } catch (cookieError) {
    // Ignore and fallback
  }

  const supabase = await createServerClient();
  // Security: use getUser() not getSession(). getSession() only reads from cookies
  // without server-side JWT validation. getUser() verifies the token with Supabase auth server.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, session: null, role: DEFAULT_ROLE, permissions: [], mfaLevel: null };
  }

  // Reconstruct a minimal session-like object for compatibility
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session ?? null;

  // Security: app_metadata is server-controlled (set by admin/service role only).
  // It is the authoritative source of truth for roles.
  // user_metadata is user-editable and must NOT be trusted for role assignment.
  const appMetadata = user.app_metadata as Record<string, unknown> | undefined;
  const metadataRole = extractRoleFromMetadata(appMetadata);
  
  // Extract dynamically injected permissions from custom claims trigger
  const permissions = Array.isArray(appMetadata?.permissions) ? (appMetadata?.permissions as string[]) : [];

  // DB profile role is the fallback when app_metadata has no role set.
  // We do NOT use pickHighestRole() as that could allow a stale DB value to override
  // a deliberately set app_metadata role. Prefer app_metadata first, DB second.
  const resolvedRole: UserRole = metadataRole ?? (await fetchProfileRole(supabase, user.id)) ?? DEFAULT_ROLE;

  let mfaLevel: string | null = null;
  if (resolvedRole === 'admin' || resolvedRole === 'superadmin') {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    mfaLevel = data?.currentLevel ?? 'aal1';
  }

  return { supabase, session, role: resolvedRole, permissions, mfaLevel };
}

export const roleMatches = (role: UserRole, options: RoleCheckOptions): boolean => {
  const { allowedRoles, minimumRole } = options;

  const allowedMatch = Array.isArray(allowedRoles) && allowedRoles.length > 0
    ? allowedRoles.includes(role)
    : false;

  const hierarchyMatch = minimumRole ? isAtLeast(role, minimumRole) : false;

  if (allowedRoles && allowedRoles.length > 0) {
    return allowedMatch || hierarchyMatch;
  }

  if (minimumRole) {
    return hierarchyMatch;
  }

  return true;
};

export async function requireApiRole(options: RoleCheckOptions = {}) {
  const { withTelemetry } = await import('./telemetry');
  
  return withTelemetry('auth.requireApiRole', async () => {
    const { supabase, session, role, permissions, mfaLevel } = await getServerAuthState();

    if (!session) {
      const error = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const { telemetry } = await import('./telemetry');
      telemetry.getTracer().startActiveSpan('auth.failure', (span) => {
        span.setAttributes({
          'auth.failure_reason': 'No active session',
        });
        span.setStatus({ code: 2, message: 'Unauthorized' }); // 2 is ERROR
        span.end();
      });
      return { error } as const;
    }

    if (!roleMatches(role, options)) {
      const error = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const { telemetry } = await import('./telemetry');
      telemetry.getTracer().startActiveSpan('auth.failure', (span) => {
        span.setAttributes({
          'auth.user_id': session.user.id,
          'auth.role': role,
          'auth.failure_reason': 'Insufficient role',
          'auth.required_options': JSON.stringify(options),
        });
        span.setStatus({ code: 2, message: 'Forbidden' });
        span.end();
      });
      return { error } as const;
    }

    if ((role === 'admin' || role === 'superadmin') && mfaLevel !== 'aal2') {
      const error = NextResponse.json({ error: 'MFA Required' }, { status: 403 });
      const { telemetry } = await import('./telemetry');
      telemetry.getTracer().startActiveSpan('auth.mfa_required', (span) => {
        span.setAttributes({
          'auth.user_id': session.user.id,
          'auth.role': role,
        });
        span.setStatus({ code: 1, message: 'MFA Required' });
        span.end();
      });
      return { error } as const;
    }

    return { supabase, session, role, permissions } as const;
  }, {
    'auth.check_type': 'role_match',
  });
}

// New utility to evaluate specific permissions
export async function hasServerPermission(requiredPermission: string): Promise<boolean> {
  const { permissions, role } = await getServerAuthState();
  if (hasPermission(role, requiredPermission)) return true;
  return permissions.some((permission) => permissionImplies(permission, requiredPermission));
}

// Guard for Route Handlers and Server Actions
export async function requirePermission(requiredPermission: string) {
  const { withTelemetry } = await import('./telemetry');
  
  return withTelemetry('auth.requirePermission', async () => {
    const isAllowed = await hasServerPermission(requiredPermission);
    const { session, role, mfaLevel } = await getServerAuthState();

    if (!isAllowed) {
      const error = NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      const { telemetry } = await import('./telemetry');
      
      try {
        telemetry.getTracer().startActiveSpan('auth.failure', (span) => {
          span.setAttributes({
            'auth.user_id': session?.user?.id || 'unknown',
            'auth.role': role || 'unknown',
            'auth.attempted_resource': requiredPermission,
            'auth.failure_reason': 'Insufficient permissions',
          });
          span.setStatus({ code: 2, message: 'Forbidden' });
          span.end();
        });
      } catch (e) {
        // Fallback if telemetry fails
      }
      
      return { error } as const;
    }

    if ((role === 'admin' || role === 'superadmin') && mfaLevel !== 'aal2') {
      const error = NextResponse.json({ error: 'MFA Required' }, { status: 403 });
      const { telemetry } = await import('./telemetry');
      try {
        telemetry.getTracer().startActiveSpan('auth.mfa_required', (span) => {
          span.setAttributes({
            'auth.user_id': session?.user?.id || 'unknown',
            'auth.role': role,
            'auth.attempted_resource': requiredPermission,
          });
          span.setStatus({ code: 1, message: 'MFA Required' });
          span.end();
        });
      } catch (e) {}
      
      return { error } as const;
    }
    
    return { success: true } as const;
  }, {
    'auth.attempted_resource': requiredPermission,
    'auth.check_type': 'permission_check',
  });
}

const REGION_SCOPED_ROLES = new Set<UserRole>([
  'sales_executive',
  'store_executive',
  'sales_agent',
  'service_engineer',
  'sales_manager',
  'service_manager',
  'sales',
  'sales-staff',
  'sales-external',
  'manager',
]);

/**
 * Route-handler guard for resources carrying an area_id.
 * Admins and superadmins are global; every sales/service role must have an
 * explicit user_area_assignments row for the target area.
 */
export async function requireAreaPermission(requiredPermission: string, areaId: string | null | undefined) {
  const auth = await getServerAuthState();
  if (!auth.session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  if (!hasPermission(auth.role, requiredPermission)
    && !auth.permissions.some((permission) => permissionImplies(permission, requiredPermission))) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const;
  }
  if (!REGION_SCOPED_ROLES.has(auth.role)) {
    return { ...auth, areaId: null } as const;
  }
  if (!areaId) {
    return { error: NextResponse.json({ error: 'Forbidden: Resource area is required' }, { status: 403 }) } as const;
  }

  const { data, error } = await auth.supabase
    .from('user_area_assignments')
    .select('area_id')
    .eq('user_id', auth.session.user.id)
    .eq('area_id', areaId)
    .maybeSingle();

  if (error || !data) {
    return { error: NextResponse.json({ error: 'Forbidden: Cross-region access denied' }, { status: 403 }) } as const;
  }

  return { ...auth, areaId } as const;
}
