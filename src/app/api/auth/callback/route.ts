import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireSupabasePublicEnv } from '@/lib/supabase/env';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

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
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error('PKCE exchange error:', error.message);
    }
  }

  // Graceful error propagation
  return NextResponse.redirect(`${origin}/auth/signin?error=InvalidAuthCode`);
}
