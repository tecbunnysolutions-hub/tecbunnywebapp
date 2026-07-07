import { createSupabaseServiceClient } from '../supabase/server';
import type { User } from '@supabase/supabase-js';
type AdminRole = 'admin' | 'superadmin';
export declare class AdminAuthError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export interface AdminContext {
    user: User;
    role: AdminRole;
    serviceSupabase: ReturnType<typeof createSupabaseServiceClient>;
}
export declare function requireAdminContext(): Promise<AdminContext>;
export interface SuperadminContext {
    user: User;
    role: 'superadmin';
    serviceSupabase: ReturnType<typeof createSupabaseServiceClient>;
}
export declare function requireSuperadminContext(): Promise<SuperadminContext>;
export {};
//# sourceMappingURL=admin-guard.d.ts.map