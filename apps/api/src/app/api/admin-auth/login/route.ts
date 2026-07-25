import { NextResponse } from 'next/server';
import { createSuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';
import { apiFailure, apiSuccess, apiValidationError } from '../../../../lib/api-contract';

const loginPayloadSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  password: z.string().min(10).max(128),
});

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

function getClientIp(request: Request) {
  const headers = request.headers;
  return headers.get('cf-connecting-ip')?.trim()
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')?.trim()
    || 'unknown';
}

export async function POST(request: Request) {
  const requestId = request.headers.get('x-correlation-id');
  const meta = { requestId, version: 'v1' };
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit(`superadmin_login_ip:${ip}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs);
    if (!rl.allowed) {
      return apiFailure(429, {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again in one minute.',
      }, { meta });
    }

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

    const expectedUserId = process.env.SUPERADMIN_USER_ID;
    const expectedPassword = process.env.SUPERADMIN_PASSWORD;

    if (!expectedUserId || !expectedPassword) {
      return apiFailure(503, {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Superadmin credentials are not configured in the environment',
      }, { meta });
    }

    if (userId === expectedUserId && password === expectedPassword) {
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
