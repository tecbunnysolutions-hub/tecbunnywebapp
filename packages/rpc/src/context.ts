import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';
import { BaseSupabaseClient } from '@tecbunny/infra';

function extractAccessTokenFromCookies(cookieHeader: string): string | null {
  const parts = cookieHeader.split(';');
  const chunks = new Map<string, string[]>();
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = decodeURIComponent(part.slice(idx + 1).trim());
    const match = name.match(/^(sb-.+-auth-token)(?:\.(\d+))?$/);
    if (!match) continue;
    const list = chunks.get(match[1]) ?? [];
    list[match[2] ? Number(match[2]) : 0] = value;
    chunks.set(match[1], list);
  }

  for (const list of chunks.values()) {
    const combined = list.filter(Boolean).join('');
    try {
      const parsed = JSON.parse(combined) as { access_token?: string } | string[];
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.access_token === 'string') {
        return parsed.access_token;
      }
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        return parsed[0];
      }
    } catch {
      if (combined.split('.').length === 3) return combined;
    }
  }
  return null;
}

async function hydrateSupabaseUser(token: string, url: string, anonKey: string) {
  const baseClient = new BaseSupabaseClient({ url, key: anonKey });
  const { data, error } = await baseClient.rawClient.auth.getUser(token);
  if (error || !data?.user) return null;
  const claims = await baseClient.rawClient.auth.getClaims(token);
  const mfaLevel =
    !claims.error && claims.data?.claims.sub === data.user.id && typeof claims.data.claims.aal === 'string'
      ? claims.data.claims.aal
      : null;
  return {
    session: { user: data.user },
    role: data.user.app_metadata?.role || 'customer',
    mfaLevel,
  };
}

export async function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  
  let session = null;
  let role = null;
  let mfaLevel: string | null = null;

  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const superadminCookieMatch = cookieHeader.match(/superadmin-session=([^;]+)/);
    
    if (superadminCookieMatch) {
      const superadminPayload = await verifySuperadminSessionToken(superadminCookieMatch[1]);
      if (superadminPayload) {
        session = { user: { id: 'superadmin-root-id', email: superadminPayload.email } };
        role = 'superadmin';
        mfaLevel = 'aal2';
      }
    }

    if (!session && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const authHeader = req.headers.get('authorization');
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
      const token = bearer || extractAccessTokenFromCookies(cookieHeader);
      if (token) {
        const hydrated = await hydrateSupabaseUser(token, SUPABASE_URL, SUPABASE_ANON_KEY);
        if (hydrated) {
          session = hydrated.session;
          role = hydrated.role;
          mfaLevel = hydrated.mfaLevel;
        }
      }
    }
  } catch (error) {
    // Ignore auth extraction errors
  }

  return {
    req,
    resHeaders,
    session,
    role,
    mfaLevel,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
