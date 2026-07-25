import { NextResponse } from 'next/server';
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from '@tecbunny/core/auth/superadmin-session';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(10).max(128),
  isSuperadmin: z.boolean().optional().default(false),
});

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

function getClientIp(request: Request) {
  const headers = request.headers;
  return headers.get('cf-connecting-ip')?.trim()
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')?.trim()
    || 'unknown';
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await rateLimit(`waba_login_ip:${ip}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again in one minute.' }, { status: 429 });
    }

    const parsed = loginSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid login payload' }, { status: 400 });
    }

    const { email, password, isSuperadmin } = parsed.data;

    if (isSuperadmin) {
      const expectedEmail = (process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
      const expectedPassword = process.env.SUPERADMIN_PASSWORD;
      const normalizedEmail = email.trim().toLowerCase();

      if (expectedEmail && expectedPassword && normalizedEmail === expectedEmail && password === expectedPassword) {
        const token = await createSuperadminSessionToken(expectedEmail, req as unknown as Request);
        const response = NextResponse.json({ success: true, user: { id: 'superadmin-root-id', email: expectedEmail } });

        response.cookies.set({
          name: 'superadmin-session',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: SUPERADMIN_SESSION_TTL_SECONDS
        });

        return response;
      }
      return NextResponse.json({ error: 'Invalid superadmin credentials' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Staff should use Supabase auth directly' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
