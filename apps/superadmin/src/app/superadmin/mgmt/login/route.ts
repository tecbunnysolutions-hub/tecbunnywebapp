import { NextResponse } from 'next/server';
import { verifyCaptcha } from "@tecbunny/core/server";
import { logger } from "@tecbunny/core";
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from "@tecbunny/core/server";
import { verifySuperadminLogin, getSuperadminLoginConfig } from "@tecbunny/core/auth/superadmin-login";

// Trusted only when Cloudflare (or another configured reverse proxy) is guaranteed
// to overwrite/strip these headers before the request reaches the origin.
function getClientIp(request: Request) {
  const headers = request.headers;
  return headers.get('cf-connecting-ip')?.trim()
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')?.trim()
    || 'unknown';
}

export async function POST(request: Request) {
  try {
    const { userId, email, password, captchaToken } = await request.json();
    const ip = getClientIp(request);
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

    const result = await verifySuperadminLogin({
      identifier: submittedUserId,
      password: submittedPassword,
      ip,
      rateLimit: { scope: 'superadmin_mgmt_login', limit: 5, windowMs: 15 * 60 * 1000 },
    });

    if (!result.ok && result.reason === 'rate_limited') {
      logger.warn('superadmin_login.rate_limited', { ip, userId: submittedUserId });
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    // SECURITY: the password hash is mandatory; plaintext passwords are not supported.
    if (!result.ok && result.reason === 'not_configured') {
      const config = getSuperadminLoginConfig();
      logger.error('superadmin_login.configuration_missing', {
        hasSuperadminUserId: !!config.userId,
        hasSuperadminEmail: !!config.email,
        hasSuperadminPasswordHash: !!config.passwordHash,
      });
      return NextResponse.json({ error: 'Superadmin credentials are not properly configured on server.' }, { status: 500 });
    }

    if (!result.ok) {
      logger.warn('superadmin_login.failed_attempt', { userId: submittedUserId, ip });
      return NextResponse.json({ error: 'Invalid superadmin credentials.' }, { status: 401 });
    }

    const token = await createSuperadminSessionToken(result.userId, request);

    logger.info('superadmin_login.success', { userId: submittedUserId, ip });

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
