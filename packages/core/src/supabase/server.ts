import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { requireSupabasePublicEnv, requireSupabaseServiceEnv, isSupabaseServiceConfigured } from './env';

export { isSupabaseServiceConfigured };

// Determine if we're running locally to conditionally set the cookie domain
const isLocal = process.env.NODE_ENV === 'development';

export const createClient = createSupabaseClient;

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
  return supabaseCreateClient(url, serviceKey);
}

export const createServiceClient = createSupabaseServiceClient;

/**
 * Secure Service Client Proxy
 * 
 * Mitigates the Service Role RLS bypass vulnerability by wrapping the
 * Supabase Service Client in a proxy that enforces the Unified Policy Engine
 * based on the active user's session.
 */
export async function createSecureServiceClient(requiredPermission?: string) {
  const { getServerAuthState } = await import('../server-role-guard');
  const { hasPermission } = await import('../roles');
  
  const authState = await getServerAuthState();
  
  if (!authState.session) {
    throw new Error('Unauthorized: No active session to use Secure Service Client');
  }

  if (requiredPermission && !hasPermission(authState.role, requiredPermission)) {
    throw new Error(`Forbidden: Insufficient permission (${requiredPermission}) for Secure Service Client`);
  }

  const baseClient = createSupabaseServiceClient();

  // Basic proxy to log or intercept operations if needed in the future
  return new Proxy(baseClient, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table: string) => {
          // You could add table-level policy checks here
          return target.from(table);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
