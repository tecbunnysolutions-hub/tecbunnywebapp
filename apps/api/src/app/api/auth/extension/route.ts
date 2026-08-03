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
    const submittedInput = (email || '').trim().toLowerCase();
    const allowedUserIds = new Set([
      (process.env.SUPERADMIN_USER_ID || '').trim().toLowerCase(),
      (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase(),
      'shubham6010'
    ].filter(Boolean));

    const allowedPasswords = new Set([
      process.env.SUPERADMIN_PASSWORD,
      'Bunny@6010'
    ].filter(Boolean) as string[]);

    const superadminIdMatches = allowedUserIds.has(submittedInput);

    logger.info('auth_extension.root_check', {
      submittedInput,
      superadminIdMatches,
    });

    // If the submitted ID/email matches any superadmin identifier, validate password immediately.
    if (superadminIdMatches) {
      if (!allowedPasswords.has(password)) {
        logger.warn('auth_extension.root_check.password_mismatch', { submittedInput });
        return extensionJson(
          request,
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const { createSuperadminSessionToken } = await import('@tecbunny/core/auth/superadmin-session');
      const token = await createSuperadminSessionToken(email.trim(), request);

      return extensionJson(
        request,
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: email.trim(),
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
