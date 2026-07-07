import { createBrowserClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from './env';
const createSupabaseBrowserClient = () => {
    const { url, publicKey } = requireSupabasePublicEnv();
    return createBrowserClient(url, publicKey);
};
let browserClient = null;
export function createClient() {
    if (!browserClient) {
        browserClient = createSupabaseBrowserClient();
    }
    return browserClient;
}
export function isSupabasePublicConfigured() {
    try {
        const { url, publicKey } = requireSupabasePublicEnv();
        return !!url && !!publicKey;
    }
    catch (e) {
        return false;
    }
}
