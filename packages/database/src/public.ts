import { createClient } from '@supabase/supabase-js';

import { requireSupabasePublicEnv } from './env';

/**
 * Cookie-free anon client for public, cacheable reads. Unlike getServerClient it never
 * touches cookies()/headers(), so routes using it can be cached by the CDN.
 */
export function createPublicClient() {
  const { url, publicKey } = requireSupabasePublicEnv();
  return createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
