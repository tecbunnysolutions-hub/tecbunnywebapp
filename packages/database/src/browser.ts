import { createBrowserClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from './env';
import type { Database } from './types';

const createSupabaseBrowserClient = () => {
  const { url, publicKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, publicKey);
};

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;
let browserClientInstance: BrowserSupabaseClient | null = null;

export function getBrowserClient(): BrowserSupabaseClient {
  if (!browserClientInstance) {
    browserClientInstance = createSupabaseBrowserClient();
  }
  return browserClientInstance;
}

export { getBrowserClient as createClient };
export { getBrowserClient as getClient };

export function isSupabasePublicConfigured(): boolean {
  try {
    const { url, publicKey } = requireSupabasePublicEnv();
    return !!url && !!publicKey;
  } catch {
    return false;
  }
}
