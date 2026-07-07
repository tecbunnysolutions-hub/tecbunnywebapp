import { SupabaseClient } from '@supabase/supabase-js';
export declare class DbClient {
    private client;
    constructor(client: SupabaseClient);
    /**
     * Direct access to the underlying Supabase Client if needed for edge cases
     */
    get supabase(): SupabaseClient<any, "public", "public", any, any>;
    get from(): {
        <TableName extends string, Table extends any>(relation: TableName): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, Table, TableName, Table extends {
            Relationships: infer R;
        } ? R : unknown>;
        <ViewName extends string, View extends any>(relation: ViewName): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, View, ViewName, View extends {
            Relationships: infer R;
        } ? R : unknown>;
    };
    get rpc(): <FnName extends string, Fn extends any>(fn: FnName, args?: Fn["Args"] | undefined, options?: {
        head?: boolean;
        get?: boolean;
        count?: "exact" | "planned" | "estimated";
    }) => import("@supabase/postgrest-js").PostgrestFilterBuilder<any, any, Fn["Returns"] extends any[] ? Fn["Returns"][number] extends Record<string, unknown> ? Fn["Returns"][number] : never : never, Fn["Returns"], FnName, null, "RPC">;
    get storage(): import("@supabase/storage-js").StorageClient;
    get auth(): import("@supabase/supabase-js/dist/module/lib/SupabaseAuthClient").SupabaseAuthClient;
    /**
     * Standardized execute method to unwrap Supabase { data, error }
     * and throw typed DatabaseError on failure.
     */
    execute<T>(query: PromiseLike<{
        data: T;
        error: any;
    }>): Promise<T>;
    /**
     * Execute but returns null instead of throwing when not found or gracefully ignoring specific schema errors
     */
    executeMaybe<T>(query: PromiseLike<{
        data: T;
        error: any;
    }>, ignoreSchemaErrors?: boolean): Promise<T | null>;
}
/**
 * Returns a singleton DbClient using the Service Role key (bypasses RLS).
 * Shared across the Node process.
 */
export declare function getAdminDb(): DbClient;
/**
 * Creates a DbClient bound to the current user's SSR cookies.
 * This MUST be called dynamically per-request, not cached globally.
 */
export declare function getUserDb(): Promise<DbClient>;
//# sourceMappingURL=client.d.ts.map