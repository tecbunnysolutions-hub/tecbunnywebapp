import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core';
import { createSuperadminSessionToken } from '@tecbunny/core/server';
import { verifySuperadminLogin, getSuperadminLoginConfig } from '@tecbunny/core/auth/superadmin-login';

export const dynamic = 'force-dynamic';

const ALLOWED_WEB_ORIGINS = new Set([
  'https://tecbunny.com',
  'https://www.tecbunny.com',
  'https://superadmin.tecbunny.com',
  'https://api.tecbunny.com',
  'https://mgmt.tecbunny.com',
]);

function isAllowedExtensionOrigin(origin: string) {
  return /^chrome-extension:\/\/[a-p]{32}$/i.test(origin.trim());
}

function getCorsHeaders(request: NextRequest) {
  const origin = (request.headers.get('origin') || '').trim();
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-correlation-id',
    'Access-Control-Max-Age': '600',
  };

  if (origin && (isAllowedExtensionOrigin(origin) || ALLOWED_WEB_ORIGINS.has(origin))) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    logger.info('superadmin_extension_auth.requested');

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const config = getSuperadminLoginConfig();
    if (!config.configured) {
      logger.error('superadmin_extension_auth.configuration_missing');
      return NextResponse.json(
        { error: 'Superadmin credentials are not configured on the server.' },
        { status: 503, headers: corsHeaders }
      );
    }

    const submittedInput = (email || '').trim();
    const submittedPassword = String(password ?? '').trim();
    const ip = request.headers.get('cf-connecting-ip')?.trim()
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')?.trim()
      || 'unknown';

    const rootLogin = await verifySuperadminLogin({
      identifier: submittedInput,
      password: submittedPassword,
      ip,
      identity: 'any',
      rateLimit: { scope: 'superadmin_extension', limit: 5, windowMs: 15 * 60 * 1000 },
    });

    if (rootLogin.ok) {
      const token = await createSuperadminSessionToken(submittedInput, request);

      logger.info('superadmin_extension_auth.success', { userId: submittedInput });

      return NextResponse.json(
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: email.trim(),
            role: 'superadmin',
          },
        },
        { status: 200, headers: corsHeaders }
      );
    }

    if (rootLogin.reason === 'rate_limited') {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    logger.warn('superadmin_extension_auth.invalid_credentials', { submittedInput });
    return NextResponse.json(
      { error: 'Invalid login credentials' },
      { status: 401, headers: corsHeaders }
    );
  } catch (error: any) {
    logger.error('superadmin_extension_auth.error', {
      error: error?.message || String(error),
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
