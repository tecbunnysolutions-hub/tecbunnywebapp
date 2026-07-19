import { NextResponse } from 'next/server';
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from '@tecbunny/core/auth/superadmin-session';

export async function POST(req: Request) {
  try {
    const { password, isSuperadmin } = await req.json();

    if (isSuperadmin) {
      const expectedEmail = process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL;
      const expectedPassword = process.env.SUPERADMIN_PASSWORD;

      if (expectedEmail && expectedPassword && password === expectedPassword) {
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
