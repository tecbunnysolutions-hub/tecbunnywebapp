import { createBrowserClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from './env';

const createSupabaseBrowserClient = () => {
  const { url, publicKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, publicKey);
};

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;
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
