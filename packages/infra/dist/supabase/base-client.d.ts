import { SupabaseClient } from '@supabase/supabase-js';
export interface SupabaseClientOptions {
    url: string;
    key: string;
    autoRefreshToken?: boolean;
    persistSession?: boolean;
}
export declare class BaseSupabaseClient {
    readonly client: SupabaseClient;
    constructor(options: SupabaseClientOptions);
    /**
     * Helper to execute a query and automatically log errors if they occur.
     */
    executeQuery<T>(queryPromise: PromiseLike<{
        data: T | null;
        error: any;
        count?: number | null;
    }>, context: string): Promise<{
        data: T | null;
        count?: number | null;
    }>;
    /**
     * Access to the raw client if necessary, though repositories should prefer executeQuery.
     */
    get rawClient(): SupabaseClient;
}
//# sourceMappingURL=base-client.d.ts.map