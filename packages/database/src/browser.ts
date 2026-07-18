import { createBrowserClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from './env';

const createSupabaseBrowserClient = () => {
  let url = 'https://placeholder.supabase.co';
  let publicKey = 'placeholder-anon-key';

  try {
    ({ url, publicKey } = requireSupabasePublicEnv());
  } catch {
    if (typeof window !== 'undefined') {
      throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
    }
  }

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
