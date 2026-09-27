import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { ExtensionAuthError, assertExtensionOrigin, extensionJson, extensionOptionsResponse, getExtensionCorsHeaders } from '../../extension-security';
import { logger } from '@tecbunny/core/logger';
import { getTrustedClientIp, verifySuperadminLogin } from '@tecbunny/core/server';

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

export async function OPTIONS(request: NextRequest) {
  logger.info('auth_extension.audit.options_requested');
  return extensionOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    logger.info('auth_extension.audit.requested');
    assertExtensionOrigin(request);

    const body = await request.json();
    const { email, password, otp } = body;

    if (!email || !password) {
      return extensionJson(
        request,
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Root (superadmin) identifiers go through the shared root verifier:
    // attempt limits, password hash and, when configured, an authenticator code.
    const submittedInput = (email || '').trim();
    const allowedUserIds = [process.env.SUPERADMIN_USER_ID, process.env.SUPERADMIN_EMAIL]
      .map((value) => (value || '').trim())
      .filter(Boolean);
    const superadminIdMatches = allowedUserIds.some(
      (candidate) => constantTimeStringEquals(submittedInput.toLowerCase(), candidate.toLowerCase())
    );

    if (superadminIdMatches) {
      const login = await verifySuperadminLogin({
        identifier: submittedInput,
        password: String(password),
        otp: typeof otp === 'string' ? otp : null,
        clientKey: getTrustedClientIp(request),
      });
      if (!login.ok) {
        return extensionJson(request, { error: login.error }, { status: login.status });
      }

      const { createSuperadminSessionToken } = await import('@tecbunny/core/auth/superadmin-session');
      const token = await createSuperadminSessionToken(login.email, request);

      return extensionJson(
        request,
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: login.email,
            role: 'superadmin'
          }
        },
        { status: 200 }
      );
    }

    const supabase = await createClient();
    
    let loginEmail = (email || '').trim();

    if (loginEmail && !loginEmail.includes('@')) {
      const isPhone = /^\+?[0-9]+$/.test(loginEmail.replace(/[-\s()]/g, ''));
      if (!isPhone) {
        try {
          // Exact username match only; request text never enters filter syntax.
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .eq('full_name', loginEmail)
            .limit(1)
            .maybeSingle();

          if (profileData?.email) {
            loginEmail = profileData.email;
          } else {
            const { data: userData } = await supabase
              .from('sys_users')
              .select('id')
              .eq('employee_code', loginEmail)
              .maybeSingle();

            if (userData?.id) {
              const { data: profileByUserId } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', userData.id)
                .maybeSingle();
              
              if (profileByUserId?.email) {
                loginEmail = profileByUserId.email;
              }
            }
          }
        } catch (resolveError) {
          logger.error('auth_extension.resolve_email.failed', { error: resolveError, input: loginEmail });
        }
      }
    }

    // Fallback: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error || !data.session) {
      return extensionJson(
        request,
        { error: error?.message || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Verify they are an admin. user_metadata is user-editable and never grants a role.
    const role = data.user.app_metadata?.role;
    if (role !== 'admin' && role !== 'superadmin') {
      // Sign out since they don't have privileges
      await supabase.auth.signOut();
      return extensionJson(
        request,
        { error: 'Forbidden: Requires admin privileges' },
        { status: 403 }
      );
    }

    return extensionJson(
      request,
      {
        success: true,
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('auth_extension.audit.failed', { error: error?.message || String(error) });
    if (error instanceof ExtensionAuthError) {
      return extensionJson(request, { error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || error}` },
      { status: error?.status || 500, headers: getExtensionCorsHeaders(request) }
    );
  }
}
