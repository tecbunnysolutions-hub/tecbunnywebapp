import { ALL_ROLES, normalizeRole as normalizeKnownRole } from '..';
import { createSupabaseClient, createSupabaseServiceClient } from '../supabase/server';
import { isSupabaseServiceConfigured } from '../supabase/env';
import { cookies } from 'next/headers';
import { logger } from '..';
import { verifySuperadminSessionToken } from './superadmin-session';
export class AdminAuthError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function isAdminRole(role) {
    return role === 'admin' || role === 'superadmin';
}
const METADATA_ROLE_KEYS = ['role', 'default_role', 'app_role', 'user_role'];
const METADATA_ROLE_ARRAY_KEYS = ['roles', 'app_roles'];
const UNSAFE_METADATA_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const isPlainRecord = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
        return false;
    return !Object.keys(value).some((key) => UNSAFE_METADATA_KEYS.has(key));
};
const isCanonicalRole = (value) => {
    return typeof value === 'string' && ALL_ROLES.includes(value);
};
const normalizeRole = (value) => {
    return normalizeKnownRole(value);
};
const extractRoleFromMetadata = (metadata) => {
    if (!isPlainRecord(metadata))
        return null;
    for (const key of METADATA_ROLE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(metadata, key) && isCanonicalRole(metadata[key])) {
            return metadata[key];
        }
    }
    for (const key of METADATA_ROLE_ARRAY_KEYS) {
        const value = metadata[key];
        if (Array.isArray(value) && value.every(isCanonicalRole)) {
            return value[0] ?? null;
        }
    }
    return null;
};
export async function requireAdminContext() {
    try {
        const superadminContext = await requireSuperadminContext();
        return superadminContext;
    }
    catch {
        // Fall through to the standard Supabase-backed admin flow.
    }
    const supabase = await createSupabaseClient();
    const { data: { user }, error, } = await supabase.auth.getUser();
    if (error) {
        logger.warn('admin_auth_get_user_failed', { error: error.message });
    }
    if (!user) {
        throw new AdminAuthError(401, 'Authentication required');
    }
    const serviceSupabase = isSupabaseServiceConfigured ? createSupabaseServiceClient() : supabase;
    const { data: profile, error: profileError } = await serviceSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profileError) {
        logger.warn('admin_auth_profile_lookup_failed', {
            error: profileError.message,
            code: profileError.code,
        });
        if (!isSupabaseServiceConfigured) {
            logger.warn('admin_auth_profile_fallback_metadata');
        }
        else {
            throw new AdminAuthError(500, 'Failed to verify admin profile');
        }
    }
    // Security fix: Do not trust user_metadata for admin roles.
    const metadataRole = extractRoleFromMetadata(user.app_metadata);
    const profileRole = normalizeRole(profile?.role);
    let resolvedRole = metadataRole ?? profileRole ?? 'customer';
    // Strip superadmin claim from standard database-backed accounts
    if (resolvedRole === 'superadmin') {
        resolvedRole = 'customer';
    }
    if (!isAdminRole(resolvedRole)) {
        throw new AdminAuthError(403, 'Insufficient permissions');
    }
    return {
        user,
        role: resolvedRole,
        serviceSupabase,
    };
}
export async function requireSuperadminContext() {
    try {
        const cookieStore = await cookies();
        const superadminCookie = cookieStore.get('superadmin-session')?.value;
        const payload = await verifySuperadminSessionToken(superadminCookie);
        if (payload) {
            const serviceSupabase = isSupabaseServiceConfigured ? createSupabaseServiceClient() : (await createSupabaseClient());
            return {
                user: {
                    id: 'superadmin-root-id',
                    email: payload.email,
                    app_metadata: { role: 'superadmin' },
                    user_metadata: {},
                    aud: 'authenticated',
                    created_at: new Date().toISOString()
                },
                role: 'superadmin',
                serviceSupabase
            };
        }
    }
    catch (cookieError) {
        logger.warn('admin_guard.superadmin_cookie_check_failed', { error: cookieError });
    }
    throw new AdminAuthError(403, 'Superadmin permissions required');
}
