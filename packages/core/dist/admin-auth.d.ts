/**
 * Admin Authentication Helper
 * Checks if a user has admin role from app_metadata (secure) or profiles table (fallback)
 */
import { SupabaseClient, User } from '@supabase/supabase-js';
export declare function isUserAdmin(user: User, supabase: SupabaseClient): Promise<boolean>;
export declare function requireAdmin(user: User | null, supabase: SupabaseClient): Promise<{
    isAdmin: boolean;
    error?: string;
    status?: number;
}>;
export declare function isUserSuperadmin(user: User, supabase: SupabaseClient): Promise<boolean>;
export declare function requireSuperadmin(user: User | null, supabase: SupabaseClient): Promise<{
    isSuperadmin: boolean;
    error?: string;
    status?: number;
}>;
//# sourceMappingURL=admin-auth.d.ts.map