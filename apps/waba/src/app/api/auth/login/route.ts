import { NextResponse } from 'next/server';
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from '@tecbunny/core/auth/superadmin-session';
import { verifySuperadminLogin } from '@tecbunny/core/auth/superadmin-login';
import { getTrustedClientIp } from '@tecbunny/core/request-ip';
import { logger } from '@tecbunny/core/logger';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(10).max(128),
  otp: z.string().trim().max(10).optional(),
  isSuperadmin: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    logger.info('waba_auth_login.audit.requested');

    const parsed = loginSchema.safeParse(await req.json());
    if (!parsed.success) {
      logger.warn('waba_auth_login.audit.invalid_payload');
      return NextResponse.json({ error: 'Invalid login payload' }, { status: 400 });
    }

    const { email, password, otp, isSuperadmin } = parsed.data;

    if (isSuperadmin) {
      const login = await verifySuperadminLogin({ identifier: email, password, otp, clientKey: getTrustedClientIp(req) });

      if (login.ok) {
        const expectedEmail = login.email;
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

        logger.info('waba_auth_login.audit.success', { isSuperadmin: true });
        return response;
      }
      logger.warn('waba_auth_login.audit.invalid_superadmin_credentials', { isSuperadmin: true });
      // 401 tells the login page to continue with the staff (Supabase) flow.
      return NextResponse.json({ error: login.error }, { status: login.status });
    }

    logger.warn('waba_auth_login.audit.unsupported_staff_flow');
    return NextResponse.json({ error: 'Staff should use Supabase auth directly' }, { status: 400 });
  } catch (error: unknown) {
    logger.error('waba_auth_login.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
