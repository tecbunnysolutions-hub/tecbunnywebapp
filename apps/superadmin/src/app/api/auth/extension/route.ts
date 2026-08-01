import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core';
import { createSuperadminSessionToken } from '@tecbunny/core/server';

export const dynamic = 'force-dynamic';

// CORS headers for chrome extension
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-correlation-id',
    'Access-Control-Max-Age': '600',
  };

  // Allow chrome-extension origins and tecbunny.com origins
  if (
    /^chrome-extension:\/\/[a-p]{32}$/i.test(origin.trim()) ||
    origin.includes('tecbunny.com') ||
    origin.trim().toLowerCase() === 'null' ||
    !origin
  ) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
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

    const submittedId = (email || '').trim();
    const correctUserId = (process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL || '').trim();
    const correctPassword = process.env.SUPERADMIN_PASSWORD;

    logger.info('superadmin_extension_auth.root_check', {
      submittedId: submittedId.toLowerCase(),
      hasCorrectUserId: !!correctUserId,
      hasExpectedPassword: !!correctPassword,
    });

    if (!correctUserId || !correctPassword) {
      return NextResponse.json(
        { error: 'Superadmin credentials are not configured on this server.' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (
      submittedId.toLowerCase() === correctUserId.toLowerCase() &&
      password === correctPassword
    ) {
      const token = await createSuperadminSessionToken(submittedId, request);

      logger.info('superadmin_extension_auth.success', { userId: submittedId });

      return NextResponse.json(
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: submittedId,
            role: 'superadmin',
          },
        },
        { status: 200, headers: corsHeaders }
      );
    }

    logger.warn('superadmin_extension_auth.invalid_credentials', { submittedId });
    return NextResponse.json(
      { error: 'Invalid login credentials' },
      { status: 401, headers: corsHeaders }
    );
  } catch (error: any) {
    logger.error('superadmin_extension_auth.error', {
      error: error?.message || String(error),
    });
    return NextResponse.json(
      { error: `Internal Server Error: ${error?.message || error}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
