import { isSupabaseServiceConfigured } from './env';
export { isSupabaseServiceConfigured };
export declare const createClient: typeof createSupabaseClient;
export declare function createSupabaseClient(): Promise<import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>>;
export declare function createSupabaseServiceClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const createServiceClient: typeof createSupabaseServiceClient;
//# sourceMappingURL=server.d.ts.map