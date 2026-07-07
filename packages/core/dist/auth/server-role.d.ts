import type { NextRequest } from 'next/server';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { type UserRole } from '../roles';
import { createClient as createServerClient } from '../supabase/server';
export declare const getEffectiveUserRole: (user: SupabaseUser | null) => Promise<UserRole | null>;
export declare const getSessionWithRole: (request: NextRequest) => Promise<{
    supabase: Awaited<ReturnType<typeof createServerClient>>;
    session: Session | null;
    role: UserRole | null;
}>;
export declare const isRoleAllowed: (role: UserRole | null, allowed: ReadonlyArray<UserRole>) => boolean;
//# sourceMappingURL=server-role.d.ts.map