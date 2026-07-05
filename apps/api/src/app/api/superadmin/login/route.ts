import { NextResponse } from 'next/server';
import { verifyCaptcha } from "@tecbunny/core/captcha/captcha-service";
import { logger } from "@tecbunny/core/logger";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from "@tecbunny/core/auth/superadmin-session";

const textEncoder = new TextEncoder();

function getClientIp(request: Request) {
  const headers = request.headers;
  return headers.get('cf-connecting-ip')?.trim()
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')?.trim()
    || 'unknown';
}

function constantTimeStringEquals(left: string, right: string) {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

export async function POST(request: Request) {
  try {
    const { userId, email, password, captchaToken } = await request.json();
    const ip = getClientIp(request);
    const submittedUserId = String(userId ?? email ?? '').trim();
    const submittedPassword = String(password ?? '');

    const ipRl = await rateLimit(`ip:${ip}`, 5, 15 * 60 * 1000);
    if (!ipRl.allowed) {
      logger.warn('superadmin_login.rate_limited', { ip, userId: submittedUserId });
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    if (submittedUserId) {
      const idRl = await rateLimit(`user:${submittedUserId}`, 5, 15 * 60 * 1000);
      if (!idRl.allowed) {
        logger.warn('superadmin_login.identifier_rate_limited', { ip, userId: submittedUserId });
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
      }
    }

    // Verify Turnstile Captcha if site key is configured
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (turnstileSiteKey) {
      const captcha = await verifyCaptcha(captchaToken, ip);
      if (!captcha.success) {
        logger.warn('superadmin_login.captcha_failed', { ip, error: captcha.error || captcha.errorCodes });
        return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 400 });
      }
    }

    const correctUserId = process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL;
    const correctPassword = process.env.SUPERADMIN_PASSWORD;

    if (!correctUserId || !correctPassword) {
      logger.error('superadmin_login.configuration_missing');
      return NextResponse.json({ error: 'Superadmin credentials are not configured on server.' }, { status: 500 });
    }

    if (
      !constantTimeStringEquals(submittedUserId, correctUserId.trim()) ||
      !constantTimeStringEquals(submittedPassword, correctPassword)
    ) {
      logger.warn('superadmin_login.failed_attempt', { userId: submittedUserId, ip });
      return NextResponse.json({ error: 'Invalid superadmin credentials.' }, { status: 401 });
    }

    const token = await createSuperadminSessionToken(correctUserId.trim());

    logger.info('superadmin_login.success', { userId: submittedUserId, ip });

    const response = NextResponse.json({ success: true, message: 'Superadmin authenticated successfully' });

    // Set secure cookie
    response.cookies.set('superadmin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SUPERADMIN_SESSION_TTL_SECONDS
    });

    response.cookies.set('tb-superadmin-active', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SUPERADMIN_SESSION_TTL_SECONDS
    });

    return response;
  } catch (error) {
    logger.error('superadmin_login.error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
  }
}
