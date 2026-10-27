import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSupabasePublicEnv } from '@tecbunny/database';
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';

// Demo passwords stay on the server; only a verified dashboard owner can request a token.
export async function POST(request: NextRequest) {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Invalid origin' }, 403);
  const session = request.cookies.get('superadmin-session')?.value;
  if (!await verifySuperadminSessionToken(session, request)) return reply({ error: 'Superadmin session required' }, 401);

  const email = process.env.API_HEALTH_DEMO_EMAIL;
  const password = process.env.API_HEALTH_DEMO_PASSWORD;
  if (!email && !password) return reply({ configured: false });
  if (!email || !password) return reply({ error: 'Set both API_HEALTH_DEMO_EMAIL and API_HEALTH_DEMO_PASSWORD on the server.' }, 503);
  try {
    const { url, publicKey } = requireSupabasePublicEnv();
    const client = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) return reply({ error: 'Configured demo account could not sign in. Check the server demo credentials.' }, 502);
    return reply({ configured: true, token: data.session.access_token, role: String(data.user.app_metadata.role ?? 'customer') });
  } catch {
    return reply({ error: 'Demo authentication is unavailable. Try again later.' }, 503);
  }
}
