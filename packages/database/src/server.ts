import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabasePublicEnv } from './env';
import type { Database } from './types';

const isLocal = process.env.NODE_ENV === 'development';

export async function getServerClient() {
  const { url, publicKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            domain: isLocal ? undefined : '.tecbunny.com',
            sameSite: 'lax',
          });
        } catch {
          // Ignore if called in Server Component during render
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            domain: isLocal ? undefined : '.tecbunny.com',
            sameSite: 'lax',
          });
        } catch {
          // Ignore if called in Server Component during render
        }
      },
    },
  });
}

// Aliases for compatibility
export { getServerClient as createServerClient };
export { getServerClient as createSupabaseClient };
export { getServerClient as getClient };
export { getServerClient as createClient };
