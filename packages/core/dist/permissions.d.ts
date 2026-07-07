import type { User as SupabaseUser } from '@supabase/supabase-js';
import { type UserRole } from './roles';
/**
 * Validates the Edge Superadmin session cookie.
 */
export declare function isSuperadminSession(): Promise<boolean>;
export declare function hasRole(user: SupabaseUser | null, requiredRole: UserRole): Promise<boolean>;
export declare function isAdmin(user: SupabaseUser | null): Promise<boolean>;
export declare function isSuperadmin(user: SupabaseUser | null): Promise<boolean>;
export declare function isManager(user: SupabaseUser | null): Promise<boolean>;
export declare function isSales(user: SupabaseUser | null): Promise<boolean>;
export declare function isAccounts(user: SupabaseUser | null): Promise<boolean>;
export declare function isServiceEngineer(user: SupabaseUser | null): Promise<boolean>;
//# sourceMappingURL=permissions.d.ts.map