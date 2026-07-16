import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseServiceEnv } from './env';

let adminClientInstance: SupabaseClient<any> | null = null;

export function getAdminClient(): SupabaseClient<any> {
  if (!adminClientInstance) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    adminClientInstance = createClient(url, serviceKey, {
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
