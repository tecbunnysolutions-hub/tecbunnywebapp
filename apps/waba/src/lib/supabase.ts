/**
 * Shared Supabase client singleton for the WABA app.
 *
 * Reconstructed module — mirrors the env-naming convention used across the
 * monorepo (see packages/database/src/env.ts and apps/public):
 *   - URL:  NEXT_PUBLIC_SUPABASE_URL
 *   - Key:  server-side secret key (SUPABASE_SECRET_KEY, falling back to the
 *           legacy SUPABASE_SERVICE_ROLE_KEY). The public key is used only
 *           outside production.
 *
 * All consumers of this module are server-side (API routes, services, agents,
 * workers), so session persistence is disabled.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// WABA server code relies on the service role. Outside production a public key
// keeps local development working; in production a missing service key must
// surface as failed requests and a logged error, not silently run as anon.
if (!serviceKey && process.env.NODE_ENV === 'production') {
  console.error('[waba] SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY is not configured; database calls will fail.');
}

const supabaseKey =
  serviceKey ||
  (process.env.NODE_ENV === 'production'
    ? 'missing-service-role-key'
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
