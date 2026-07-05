import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { requireSupabasePublicEnv, requireSupabaseServiceEnv } from './supabase/env';

// Determine if we're running locally to conditionally set the cookie domain
const isLocal = process.env.NODE_ENV === 'development';

export async function createSupabaseClient() {
  const { url, publicKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publicKey, {
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
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
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
        } catch (error) {
          // The `remove` method was called from a Server Component.
        }
      },
    },
  });
}

// Service client usually bypasses RLS and doesn't need user cookies, 
// but we provide it here for convenience.
export function createSupabaseServiceClient() {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  // Using standard client for service operations since it doesn't represent a browser user session
  return createClient(url, serviceKey);
}
