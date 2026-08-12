import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core';
import { createSuperadminSessionToken, verifySuperadminPassword } from '@tecbunny/core/server';

export const dynamic = 'force-dynamic';

const textEncoder = new TextEncoder();

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

    const configuredUserId = (process.env.SUPERADMIN_USER_ID || '').trim();
    const configuredEmail = (process.env.SUPERADMIN_EMAIL || '').trim();
    const configuredPasswordHash = process.env.SUPERADMIN_PASSWORD_HASH || '';
    const configuredPasswordPlain = process.env.SUPERADMIN_PASSWORD || '';

    if (!configuredUserId && !configuredEmail) {
      logger.error('superadmin_extension_auth.configuration_missing');
      return NextResponse.json(
        { error: 'Superadmin credentials are not configured on the server.' },
        { status: 503, headers: corsHeaders }
      );
    }
    if (!configuredPasswordHash && !configuredPasswordPlain) {
      logger.error('superadmin_extension_auth.password_not_configured');
      return NextResponse.json(
        { error: 'Superadmin credentials are not configured on the server.' },
        { status: 503, headers: corsHeaders }
      );
    }

    if (!configuredPasswordHash) {
      logger.warn('superadmin_extension_auth.using_plaintext_password', { env: process.env.NODE_ENV });
    }

    const submittedInput = (email || '').trim();
    const submittedPassword = String(password ?? '').trim();
    const allowedUserIds = [configuredUserId, configuredEmail].filter(Boolean);
    const superadminIdMatches = allowedUserIds.some(
      (candidate) => constantTimeStringEquals(submittedInput.toLowerCase(), candidate.toLowerCase())
    );

    logger.info('superadmin_extension_auth.root_check', {
      superadminIdMatches,
    });

    if (superadminIdMatches) {
      const passwordMatches = configuredPasswordHash
        ? await verifySuperadminPassword(submittedPassword, configuredPasswordHash)
        : constantTimeStringEquals(submittedPassword, configuredPasswordPlain);

      if (!passwordMatches) {
        logger.warn('superadmin_extension_auth.password_mismatch');
        return NextResponse.json(
          { error: 'Invalid login credentials' },
          { status: 401, headers: corsHeaders }
        );
      }

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
