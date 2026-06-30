import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { ALL_ROLES, hasPermission, isAtLeast, normalizeRole, permissionImplies, type UserRole } from './roles';
import { createClient } from './supabase/server';

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
}

export async function getServerAuthState(): Promise<ServerAuthState> {
  try {
    const { cookies } = await import('next/headers');
    const { verifySuperadminSessionToken } = await import('./auth/superadmin-session');
    const cookieStore = await cookies();
    const superadminCookie = cookieStore.get('superadmin-session')?.value;
    if (superadminCookie) {
      const isSuperadmin = await verifySuperadminSessionToken(superadminCookie);
      if (isSuperadmin) {
        const { createServiceClient, isSupabaseServiceConfigured } = await import('./supabase/server');
        const supabase = isSupabaseServiceConfigured ? createServiceClient() : await createClient();
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
        };
      }
    }
  } catch (cookieError) {
    // Ignore and fallback
  }

  const supabase = await createClient();
  // Security: use getUser() not getSession(). getSession() only reads from cookies
  // without server-side JWT validation. getUser() verifies the token with Supabase auth server.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, session: null, role: DEFAULT_ROLE, permissions: [] };
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

  return { supabase, session, role: resolvedRole, permissions };
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
  const { supabase, session, role, permissions } = await getServerAuthState();

  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }

  if (!roleMatches(role, options)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const;
  }

  return { supabase, session, role, permissions } as const;
}

// New utility to evaluate specific permissions
export async function hasServerPermission(requiredPermission: string): Promise<boolean> {
  const { permissions, role } = await getServerAuthState();
  if (hasPermission(role, requiredPermission)) return true;
  return permissions.some((permission) => permissionImplies(permission, requiredPermission));
}

// Guard for Route Handlers and Server Actions
export async function requirePermission(requiredPermission: string) {
  const isAllowed = await hasServerPermission(requiredPermission);
  if (!isAllowed) {
    return { error: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }) } as const;
  }
  
  return { success: true } as const;
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
