import { createSuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';
import { verifySuperadminLogin } from '@tecbunny/core/auth/superadmin-login';
import { getTrustedClientIp } from '@tecbunny/core/server';
import { z } from 'zod';
import { apiFailure, apiSuccess, apiValidationError } from '../../../../lib/api-contract';

const loginPayloadSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  password: z.string().min(10).max(128),
});

const LOGIN_RATE_LIMIT = { scope: 'superadmin_login', limit: 5, windowMs: 60 * 1000 };

export async function POST(request: Request) {
  const requestId = request.headers.get('x-correlation-id');
  const meta = { requestId, version: 'v1' };
  try {
    const ip = getTrustedClientIp(request);

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

    const { userId, password } = parsedBody.data;

    const result = await verifySuperadminLogin({
      identifier: userId,
      password,
      ip,
      caseSensitive: true,
      rateLimit: LOGIN_RATE_LIMIT,
    });

    if (!result.ok && result.reason === 'rate_limited') {
      return apiFailure(429, {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again in one minute.',
      }, { meta });
    }

    if (!result.ok && result.reason === 'not_configured') {
      return apiFailure(503, {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Superadmin credentials are not configured in the environment',
      }, { meta });
    }

    if (result.ok) {
      const token = await createSuperadminSessionToken(userId, request);

      const response = apiSuccess({ authenticated: true }, {
        message: 'Authentication successful',
        meta,
      });
      
      // Set the session cookie securely
      response.cookies.set('superadmin-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;
    }

    return apiFailure(401, {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid superadmin credentials',
    }, { meta });
  } catch (error) {
    console.error('Login error:', error);
    return apiFailure(500, {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error during authentication',
    }, { meta });
  }
}
