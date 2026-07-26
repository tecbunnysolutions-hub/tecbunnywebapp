import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from "@tecbunny/database";
import { cookies } from 'next/headers';

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function allowedCallbackOrigins() {
  const fromEnv = (process.env.AUTH_CALLBACK_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  const siteOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL?.trim() || '');
  if (siteOrigin) {
    fromEnv.push(siteOrigin);
  }

  return Array.from(new Set(fromEnv));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/';

  // Mitigate Open Redirect by strictly enforcing a relative path
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/';
  }

  if (code) {
    let supabasePublicEnv;
    try {
      supabasePublicEnv = requireSupabasePublicEnv();
    } catch (envError) {
      console.error('Callback Supabase configuration error:', envError);
      return NextResponse.redirect(`${origin}/auth/signin?error=ConfigError`);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabasePublicEnv.url,
      supabasePublicEnv.publicKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                });
              });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development';
      let safeRedirectOrigin = origin;
      const allowedOrigins = allowedCallbackOrigins();

      if (!isLocalEnv && allowedOrigins.length > 0) {
        const normalizedRequestOrigin = normalizeOrigin(origin);
        if (normalizedRequestOrigin && allowedOrigins.includes(normalizedRequestOrigin)) {
          safeRedirectOrigin = normalizedRequestOrigin;
        } else {
          safeRedirectOrigin = allowedOrigins[0];
        }
      }
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        return NextResponse.redirect(`${safeRedirectOrigin}${next}`);
      }
    } else {
      console.error('PKCE exchange error:', error.message);
    }
  }

  // Graceful error propagation
  return NextResponse.redirect(`${origin}/auth/signin?error=InvalidAuthCode`);
}
