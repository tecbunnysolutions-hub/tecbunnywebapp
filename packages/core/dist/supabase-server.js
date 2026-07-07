// Supabase client helper to prevent build-time errors
// Use this in API routes instead of creating clients at module level
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { requireSupabasePublicEnv, requireSupabaseServiceEnv } from './supabase/env';
export async function createSupabaseClient() {
    const { url, publicKey } = requireSupabasePublicEnv();
    const cookieStore = await cookies();
    return createServerClient(url, publicKey, {
        cookies: {
            get(name) {
                return cookieStore.get(name)?.value;
            },
            // Note: set and remove are generally needed for full SSR auth flow, 
            // but for basic API route fetching, `get` is sufficient to enforce RLS.
            // If setting cookies is required here in the future, standard set/remove 
            // functions mapping to cookieStore.set and cookieStore.delete should be added.
        }
    });
}
/**
 * WARNING: This client uses the service role key and BYPASSES all Row-Level Security (RLS) policies.
 * ONLY use this for internal backend tasks, webhooks, or cron jobs.
 * NEVER use this for standard user-facing API routes where data segregation is required.
 */
export function createSupabaseServiceClient() {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    return createClient(url, serviceKey);
}
