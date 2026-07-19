import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { ExtensionAuthError, assertExtensionOrigin, extensionJson, extensionOptionsResponse, getExtensionCorsHeaders } from '../../extension-security';

export async function OPTIONS(request: NextRequest) {
  return extensionOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
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
    const expectedUserId = process.env.SUPERADMIN_USER_ID;
    const expectedPassword = process.env.SUPERADMIN_PASSWORD;

    if (expectedUserId && expectedPassword && email === expectedUserId && password === expectedPassword) {
      const { createSuperadminSessionToken } = await import('@tecbunny/core/auth/superadmin-session');
      const token = await createSuperadminSessionToken(email, request);
      
      return extensionJson(
        request,
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: email,
            role: 'superadmin'
          }
        },
        { status: 200 }
      );
    }

    const supabase = await createClient();
    
    // Fallback: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
    if (error instanceof ExtensionAuthError) {
      return extensionJson(request, { error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || error}` },
      { status: error?.status || 500, headers: getExtensionCorsHeaders(request) }
    );
  }
}
