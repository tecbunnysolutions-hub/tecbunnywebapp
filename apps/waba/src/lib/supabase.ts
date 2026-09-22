/**
 * Shared Supabase client singleton for the WABA app.
 *
 * Reconstructed module — mirrors the env-naming convention used across the
 * monorepo (see packages/database/src/env.ts and apps/public):
 *   - URL:  NEXT_PUBLIC_SUPABASE_URL
 *   - Key:  server-side secret key preferred (SUPABASE_SECRET_KEY, falling
 *           back to the legacy SUPABASE_SERVICE_ROLE_KEY), then the public
 *           publishable/anon key as a last resort.
 *
 * All consumers of this module are server-side (API routes, services, agents,
 * workers), so session persistence is disabled.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
