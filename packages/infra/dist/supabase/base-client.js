import { createClient } from '@supabase/supabase-js';
import { logger } from '@tecbunny/core';
export class BaseSupabaseClient {
    client;
    constructor(options) {
        this.client = createClient(options.url, options.key, {
            auth: {
                autoRefreshToken: options.autoRefreshToken ?? false,
                persistSession: options.persistSession ?? false,
            },
        });
    }
    /**
     * Helper to execute a query and automatically log errors if they occur.
     */
    async executeQuery(queryPromise, context) {
        try {
            const { data, error, count } = await queryPromise;
            if (error) {
                logger.error(`supabase_query_error_${context}`, { error });
                throw new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
            }
            return { data, count };
        }
        catch (err) {
            if (!err.message?.startsWith('Database operation failed')) {
                logger.error(`supabase_exception_${context}`, { error: err });
                throw new Error(`Database exception: ${err.message || 'Unknown exception'}`);
            }
            throw err;
        }
    }
    /**
     * Access to the raw client if necessary, though repositories should prefer executeQuery.
     */
    get rawClient() {
        return this.client;
    }
}
