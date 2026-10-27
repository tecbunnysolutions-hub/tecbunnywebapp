import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from '@tecbunny/database';
import { revokeSuperadminSessionToken, verifySuperadminSessionToken } from '@tecbunny/core/server';
import { logger } from '@tecbunny/core/logger';

export async function POST(request: NextRequest) {
  // Caddy preserves Host, while Next's internal URL may use 0.0.0.0:3001.
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol === 'http' || forwardedProtocol === 'https' ? `${forwardedProtocol}:` : request.nextUrl.protocol;
  const publicUrl = new URL(`${protocol}//${request.headers.get('host') || request.nextUrl.host}`);
  const origin = request.headers.get('origin');
  if ((origin && origin !== publicUrl.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Invalid logout origin' }, { status: 403 });
  }

  const incoming = request.cookies.getAll();
  const authCookies = incoming.filter(({ name }) => /^sb-[A-Za-z0-9_-]+-auth-token(?:\.\d+)?$/.test(name) || ['sb-access-token', 'sb-refresh-token'].includes(name));
  const token = request.cookies.get('superadmin-session')?.value;
  const tasks: Promise<unknown>[] = [];
  if (token) {
    let decoded = token;
    try { decoded = decodeURIComponent(token); } catch { /* Still expire malformed cookies. */ }
    tasks.push((async () => {
      // This handler also accepts expired sessions for cookie cleanup. Only a
      // verified token may add a revocation entry to Redis.
      if (await verifySuperadminSessionToken(decoded, request)) await revokeSuperadminSessionToken(decoded);
    })().catch(() => logger.warn('admin_auth.logout.revoke_failed')));
  }
  if (authCookies.length) {
    tasks.push((async () => {
      try {
        const { url, publicKey } = requireSupabasePublicEnv();
        const supabase = createServerClient(url, publicKey, { cookies: { getAll: () => incoming, setAll: () => {} } });
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) logger.warn('admin_auth.logout.supabase_revoke_failed');
      } catch { logger.warn('admin_auth.logout.supabase_revoke_failed'); }
    })());
  }

  // An unavailable auth/Redis backend must not leave this browser signed in.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all(tasks),
      new Promise<void>(resolve => { timer = setTimeout(() => { logger.warn('admin_auth.logout.revoke_timeout'); resolve(); }, 5000); }),
    ]);
  } finally { if (timer) clearTimeout(timer); }

  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Clear-Site-Data', '"storage", "cache"');
  const names = new Set(['superadmin-session', 'tb-superadmin-active', ...authCookies.map(cookie => cookie.name)]);
  const secure = process.env.NODE_ENV === 'production';
  for (const name of names) {
    response.cookies.set(name, '', { path: '/', maxAge: 0, expires: new Date(0), httpOnly: true, secure, sameSite: 'lax' });
  }
  // Shared-domain SSO cookies can otherwise send /login straight back to /dashboard.
  if (publicUrl.hostname === 'tecbunny.com' || publicUrl.hostname.endsWith('.tecbunny.com')) {
    for (const name of names) {
      response.headers.append('Set-Cookie', `${name}=; Path=/; Domain=.tecbunny.com; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
    }
  }
  return response;
}
