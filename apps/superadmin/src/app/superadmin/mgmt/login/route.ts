import { NextResponse } from 'next/server';
import { verifyCaptcha } from "@tecbunny/core/server";
import { logger } from "@tecbunny/core";
import { createSuperadminSessionToken, getTrustedClientIp, SUPERADMIN_SESSION_TTL_SECONDS, verifySuperadminLogin } from "@tecbunny/core/server";

export async function POST(request: Request) {
  try {
    const { userId, email, password, captchaToken, otp } = await request.json();
    const ip = getTrustedClientIp(request);
    const submittedUserId = String(userId ?? email ?? '').trim();
    const submittedPassword = String(password ?? '');

    // Verify Turnstile Captcha if site key is configured
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (process.env.NODE_ENV === 'production' && turnstileSiteKey) {
      const captcha = await verifyCaptcha(captchaToken, ip);
      if (!captcha.success) {
        logger.warn('superadmin_login.captcha_failed', { ip, error: captcha.error || captcha.errorCodes });
        return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 400 });
      }
    }

    const login = await verifySuperadminLogin({ identifier: submittedUserId, password: submittedPassword, otp, clientKey: ip });
    if (!login.ok) {
      return NextResponse.json({ error: login.error }, { status: login.status });
    }

    const token = await createSuperadminSessionToken(login.email, request);

    logger.info('superadmin_login.success', { ip });

    const response = NextResponse.json({ success: true, message: 'Superadmin authenticated successfully' });

    // Set secure cookie
    response.cookies.set('superadmin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SUPERADMIN_SESSION_TTL_SECONDS
    });

    response.cookies.set('tb-superadmin-active', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SUPERADMIN_SESSION_TTL_SECONDS
    });

    return response;
  } catch (error) {
    logger.error('superadmin_login.error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
  }
}
