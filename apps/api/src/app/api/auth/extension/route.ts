import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { ExtensionAuthError, assertExtensionOrigin, extensionJson, extensionOptionsResponse, getExtensionCorsHeaders } from '../../extension-security';
import { logger } from '@tecbunny/core/logger';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  logger.info('auth_extension.audit.options_requested');
  return extensionOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    logger.info('auth_extension.audit.requested');
    assertExtensionOrigin(request);

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return extensionJson(
        request,
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check for hardcoded Root Console credentials first
    const expectedUserId = process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL || 'Shubham6010';
    const expectedPassword = process.env.SUPERADMIN_PASSWORD || 'Bunny@6010';

    const submittedEmail = (email || '').trim();
    const correctUserId = (expectedUserId || '').trim();

    const superadminIdMatches = correctUserId && submittedEmail.toLowerCase() === correctUserId.toLowerCase();

    logger.info('auth_extension.root_check', {
      submittedEmail: submittedEmail.toLowerCase(),
      hasCorrectUserId: !!correctUserId,
      hasExpectedPassword: !!expectedPassword,
      superadminIdMatches,
    });

    // If the submitted ID matches the superadmin user ID, validate the password immediately.
    // Do NOT fall through to Supabase for the root superadmin account.
    if (superadminIdMatches) {
      if (!expectedPassword) {
        logger.error('auth_extension.root_check.no_password_env');
        return extensionJson(
          request,
          { error: 'Superadmin credentials are not fully configured on the server.' },
          { status: 503 }
        );
      }

      if (password !== expectedPassword) {
        logger.warn('auth_extension.root_check.password_mismatch', {
          submittedEmail: submittedEmail.toLowerCase(),
        });
        return extensionJson(
          request,
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const { createSuperadminSessionToken } = await import('@tecbunny/core/auth/superadmin-session');
      const token = await createSuperadminSessionToken(submittedEmail, request);

      return extensionJson(
        request,
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: submittedEmail,
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
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .or(`email.ilike.${loginEmail}@%,full_name.ilike.${loginEmail}`)
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

    // Verify they are an admin or superadmin
    const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
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
