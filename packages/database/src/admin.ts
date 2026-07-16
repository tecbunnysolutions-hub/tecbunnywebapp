import { createClient } from '@supabase/supabase-js';
import { requireSupabaseServiceEnv } from './env';
import type { Database } from './types';

let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (!adminClientInstance) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    adminClientInstance = createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClientInstance;
}

// Aliases for compatibility
export { getAdminClient as createAdminClient };
export { getAdminClient as createSupabaseServiceClient };
export { getAdminClient as createServiceClient };
export { getAdminClient as getAdminDb };
