import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core';
import { createSuperadminSessionToken, getTrustedClientIp, verifySuperadminLogin } from '@tecbunny/core/server';

export const dynamic = 'force-dynamic';

function isAllowedOrigin(origin: string) {
  if (/^chrome-extension:\/\/[a-p]{32}$/i.test(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && (url.hostname === 'tecbunny.com' || url.hostname.endsWith('.tecbunny.com'));
  } catch {
    return false;
  }
}

// CORS headers for chrome extension
function getCorsHeaders(request: NextRequest) {
  const origin = (request.headers.get('origin') || '').trim();
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-correlation-id',
    'Access-Control-Max-Age': '600',
  };

  if (origin && isAllowedOrigin(origin)) {
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
    const { email, password, otp } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Shared root credential check: attempt limits, password hash and, when
    // configured, the authenticator code.
    const login = await verifySuperadminLogin({
      identifier: String(email),
      password: String(password),
      otp: typeof otp === 'string' ? otp : null,
      clientKey: getTrustedClientIp(request),
    });
    if (!login.ok) {
      return NextResponse.json({ error: login.error }, { status: login.status, headers: corsHeaders });
    }

    const token = await createSuperadminSessionToken(login.email, request);
    logger.info('superadmin_extension_auth.success');

    return NextResponse.json(
      {
        success: true,
        access_token: token,
        user: {
          id: 'superadmin-root-id',
          email: login.email,
          role: 'superadmin',
        },
      },
      { status: 200, headers: corsHeaders }
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
