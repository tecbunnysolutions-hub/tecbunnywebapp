import type { UserRole } from '../roles';
export declare function requireRole(minRole: UserRole): Promise<{
    readonly user: any;
    readonly role: UserRole;
    readonly supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>;
    readonly service: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any> | null;
    error?: undefined;
    readonly status?: undefined;
} | {
    readonly error: "Unauthorized";
    readonly status: 401;
    readonly user?: undefined;
    readonly role?: undefined;
    readonly supabase?: undefined;
    readonly service?: undefined;
} | {
    readonly error: "Forbidden";
    readonly status: 403;
    readonly user?: undefined;
    readonly role?: undefined;
    readonly supabase?: undefined;
    readonly service?: undefined;
}>;
//# sourceMappingURL=guard.d.ts.map