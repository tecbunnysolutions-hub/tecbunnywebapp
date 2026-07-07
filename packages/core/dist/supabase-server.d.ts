export declare function createSupabaseClient(): Promise<import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>>;
/**
 * WARNING: This client uses the service role key and BYPASSES all Row-Level Security (RLS) policies.
 * ONLY use this for internal backend tasks, webhooks, or cron jobs.
 * NEVER use this for standard user-facing API routes where data segregation is required.
 */
export declare function createSupabaseServiceClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
//# sourceMappingURL=supabase-server.d.ts.map