import type { NextRequest } from 'next/server';

import { getEffectiveUserRole, getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast, type UserRole } from '@tecbunny/core/roles';
import { createPublicClient } from '@tecbunny/database/server';

import { ServiceError } from '../services/errors';

export type V1AccessLevel = 'customer' | 'staff' | 'superadmin';

export type V1Caller = {
  userId: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
};

const REQUIRED_ROLE: Record<V1AccessLevel, UserRole> = {
  customer: 'customer',
  staff: 'sales_executive',
  superadmin: 'superadmin',
};

/** Pure role gate: 401 when there is no caller, 403 when the caller's role is too low. */
export function assertAccess(caller: Pick<V1Caller, 'role'> | null, level: V1AccessLevel): asserts caller is V1Caller {
  if (!caller) throw new ServiceError(401, 'UNAUTHENTICATED', 'Authentication required.');
  if (!isAtLeast(caller.role, REQUIRED_ROLE[level])) {
    throw new ServiceError(403, 'FORBIDDEN', 'You do not have access to this resource.');
  }
}

const bearerTokenOf = (request: NextRequest) => {
  const header = request.headers.get('authorization');
  return header?.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;
};

/**
 * Resolves the caller from a Supabase access token (`Authorization: Bearer`) or, as a fallback for
 * same-site browser calls, the session cookie. The token is verified with the Supabase auth server.
 */
export async function resolveCaller(request: NextRequest): Promise<V1Caller | null> {
  const token = bearerTokenOf(request);

  if (token) {
    const { data, error } = await createPublicClient().auth.getUser(token);
    if (error || !data.user) return null;
    const role = await getEffectiveUserRole(data.user);
    if (!role) return null;
    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      mobile: typeof data.user.user_metadata?.mobile === 'string' ? data.user.user_metadata.mobile : null,
      role,
    };
  }

  const { session, role } = await getSessionWithRole(request);
  if (!session?.user || !role) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    mobile: typeof session.user.user_metadata?.mobile === 'string' ? session.user.user_metadata.mobile : null,
    role,
  };
}

/** Authenticate and authorize in one call; throws ServiceError (handled by `v1ErrorResponse`). */
export async function requireCaller(request: NextRequest, level: V1AccessLevel): Promise<V1Caller> {
  const caller = await resolveCaller(request);
  assertAccess(caller, level);
  return caller;
}

/** Private responses must never be stored by shared caches. */
export const PRIVATE_CACHE_CONTROL = 'private, no-store';
