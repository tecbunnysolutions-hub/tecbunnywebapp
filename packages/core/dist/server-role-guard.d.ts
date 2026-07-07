import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { type UserRole } from './roles';
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
export declare function getServerAuthState(): Promise<ServerAuthState>;
export declare const roleMatches: (role: UserRole, options: RoleCheckOptions) => boolean;
export declare function requireApiRole(options?: RoleCheckOptions): Promise<{
    readonly error: NextResponse<{
        error: string;
    }>;
    readonly supabase?: undefined;
    readonly session?: undefined;
    readonly role?: undefined;
    readonly permissions?: undefined;
} | {
    readonly supabase: SupabaseClient<any, "public", "public", any, any>;
    readonly session: Session;
    readonly role: UserRole;
    readonly permissions: string[];
    error?: undefined;
}>;
export declare function hasServerPermission(requiredPermission: string): Promise<boolean>;
export declare function requirePermission(requiredPermission: string): Promise<{
    readonly error: NextResponse<{
        error: string;
    }>;
    readonly success?: undefined;
} | {
    readonly success: true;
    error?: undefined;
}>;
/**
 * Route-handler guard for resources carrying an area_id.
 * Admins and superadmins are global; every sales/service role must have an
 * explicit user_area_assignments row for the target area.
 */
export declare function requireAreaPermission(requiredPermission: string, areaId: string | null | undefined): Promise<{
    readonly error: NextResponse<{
        error: string;
    }>;
} | {
    readonly areaId: null;
    readonly supabase: SupabaseClient;
    readonly session: Session | null;
    readonly role: UserRole;
    readonly permissions: string[];
    error?: undefined;
} | {
    readonly areaId: string;
    readonly supabase: SupabaseClient;
    readonly session: Session | null;
    readonly role: UserRole;
    readonly permissions: string[];
    error?: undefined;
}>;
//# sourceMappingURL=server-role-guard.d.ts.map