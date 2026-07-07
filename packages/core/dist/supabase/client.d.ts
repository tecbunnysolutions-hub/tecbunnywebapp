declare const createSupabaseBrowserClient: () => import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>;
type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;
export declare function createClient(): BrowserSupabaseClient;
export declare function isSupabasePublicConfigured(): boolean;
export {};
//# sourceMappingURL=client.d.ts.map