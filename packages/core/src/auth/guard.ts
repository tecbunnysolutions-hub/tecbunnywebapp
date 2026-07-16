import type { UserRole } from '../roles';
import { isAtLeast, normalizeRole as normalizeKnownRole } from '../roles';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { createServerClient } from '@tecbunny/database/server';
import { logger } from '../logger';
import { cookies } from 'next/headers';
import { verifySuperadminSessionToken } from './superadmin-session';

function normalizeRole(value: unknown): UserRole | null {
  return normalizeKnownRole(value);
}

// Standard server-side role guard returning a discriminated union
export async function requireRole(minRole: UserRole) {
  try {
    const cookieStore = await cookies();
    const superadminCookie = cookieStore.get('superadmin-session')?.value;
    if (superadminCookie) {
      const isSuperadmin = await verifySuperadminSessionToken(superadminCookie);
      if (isSuperadmin) {
        const service = isSupabaseServiceConfigured ? createServiceClient() : null;
        return {
          user: {
            id: 'superadmin-system-session',
            email: 'superadmin@tecbunny.com',
            app_metadata: { role: 'superadmin' },
            user_metadata: { name: 'Superadmin' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as any,
          role: 'superadmin' as UserRole,
          supabase: service || await createServerClient(),
          service,
        } as const;
      }
    }
  } catch (cookieError) {
    logger.warn('requireRole.superadmin_cookie_check_failed', {
      error: cookieError instanceof Error ? cookieError.message : String(cookieError)
    });
  }

  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  const metadataRole = normalizeRole((user.app_metadata as Record<string, unknown> | undefined)?.role);
  let role = metadataRole;
  let profileRole: UserRole | null = null;
  let profileExists = false;

  if (!role) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, name, email, mobile')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      logger.warn('requireRole.profile_fetch_failed', {
        userId: user.id,
        error: profileError.message,
        code: profileError.code
      });
    }

    if (profile) {
      profileExists = true;
      profileRole = normalizeRole((profile as Record<string, unknown>).role);
      if (profileRole) {
        role = profileRole;
      }
    }
  }

  if (!role) {
    logger.warn('requireRole.role_missing', {
      userId: user.id,
      email: user.email,
      appMetadata: user.app_metadata
    });
    return { error: 'Forbidden', status: 403 } as const;
  }

  if (!isAtLeast(role, minRole)) {
    return { error: 'Forbidden', status: 403 } as const;
  }

  // Bug #5 fix: The previous code synced the profile role back to app_metadata.
  // Since profiles table roles are untrusted (any user could manipulate their
  // profile row), this created a privilege escalation path: manipulate profile →
  // get promoted to app_metadata on next login.
  //
  // Safe sync rules:
  // - We ONLY write to app_metadata when the authoritative source is app_metadata
  //   itself (i.e. metadataRole was already set). We never promote a profile role
  //   to app_metadata.
  // - We DO sync app_metadata → profiles (downward only) to keep RLS consistent.
  if (isSupabaseServiceConfigured && metadataRole && metadataRole !== profileRole) {
    // Sync authoritative metadata role DOWN to profiles table for RLS consistency.
    // This direction is safe: app_metadata is admin-only writable.
    try {
      const service = createServiceClient();
      if (profileExists) {
        await service.from('profiles').update({ role: metadataRole }).eq('id', user.id);
      } else {
        const name =
          (user.user_metadata as Record<string, unknown> | undefined)?.name ||
          (user.user_metadata as Record<string, unknown> | undefined)?.full_name ||
          user.email?.split('@')[0] ||
          'User';
        const mobile = (user.user_metadata as Record<string, unknown> | undefined)?.mobile ?? null;
        await service.from('profiles').insert({
          id: user.id,
          name,
          email: user.email ?? '',
          mobile,
          role: metadataRole,
        });
      }
    } catch (profileSyncError) {
      logger.warn('requireRole.profile_sync_failed', {
        userId: user.id,
        error: profileSyncError instanceof Error ? profileSyncError.message : String(profileSyncError),
      });
    }
  }

  const service = isSupabaseServiceConfigured ? createServiceClient() : null;
  return { user, role, supabase, service } as const;
}
