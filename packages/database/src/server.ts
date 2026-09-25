import { createServerClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from './env';
export * from './env';
export * from './types';

const isLocal = process.env.NODE_ENV === 'development';

export async function getServerClient() {
  const { url, publicKey } = requireSupabasePublicEnv();
  const { cookies, headers } = await import('next/headers');
  const cookieStore = await cookies();
  const authorization = (await headers()).get('authorization');
  const bearer = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];

  return createServerClient(url, publicKey, {
    ...(bearer && !/^v[12]\./.test(bearer) ? { global: { headers: { Authorization: `Bearer ${bearer}` } } } : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set({
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
    },
  });
}

// Aliases for compatibility
export { getServerClient as createServerClient };
export { getServerClient as createSupabaseClient };
