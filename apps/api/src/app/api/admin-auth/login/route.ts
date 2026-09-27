import { createSuperadminSessionToken, SUPERADMIN_SESSION_TTL_SECONDS } from '@tecbunny/core/auth/superadmin-session';
import { getTrustedClientIp, verifyCaptcha, verifySuperadminLogin } from '@tecbunny/core/server';
import { z } from 'zod';
import { apiFailure, apiSuccess, apiValidationError } from '../../../../lib/api-contract';

const loginPayloadSchema = z.object({
  userId: z.string().trim().min(1).max(320),
  password: z.string().min(10).max(128),
  otp: z.string().trim().max(10).optional(),
  captchaToken: z.string().max(4096).optional(),
});

export async function POST(request: Request) {
  const requestId = request.headers.get('x-correlation-id');
  const meta = { requestId, version: 'v1' };
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return apiFailure(400, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON body',
      }, { meta });
    }

    const parsedBody = loginPayloadSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiValidationError(parsedBody.error, meta);
    }

    const { userId, password, otp, captchaToken } = parsedBody.data;
    const ip = getTrustedClientIp(request);

    // Same bot check as the superadmin console login when Turnstile is configured.
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      const captcha = await verifyCaptcha(captchaToken ?? null, ip);
      if (!captcha.success) {
        return apiFailure(400, { code: 'VALIDATION_ERROR', message: 'Security verification failed. Please try again.' }, { meta });
      }
    }

    const login = await verifySuperadminLogin({ identifier: userId, password, otp, clientKey: ip });
    if (!login.ok) {
      const code = login.status === 429 ? 'RATE_LIMITED' : login.status === 503 ? 'SERVICE_UNAVAILABLE' : 'INVALID_CREDENTIALS';
      return apiFailure(login.status, { code, message: login.error }, { meta });
    }

    const token = await createSuperadminSessionToken(login.email, request);
    const response = apiSuccess({ authenticated: true }, {
      message: 'Authentication successful',
      meta,
    });

    response.cookies.set('superadmin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SUPERADMIN_SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return apiFailure(500, {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error during authentication',
    }, { meta });
  }
}
