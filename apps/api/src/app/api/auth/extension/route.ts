import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for hardcoded Root Console credentials first
    const expectedUserId = process.env.SUPERADMIN_USER_ID;
    const expectedPassword = process.env.SUPERADMIN_PASSWORD;

    if (expectedUserId && expectedPassword && email === expectedUserId && password === expectedPassword) {
      const { createSuperadminSessionToken } = await import('@tecbunny/core/auth/superadmin-session');
      const token = await createSuperadminSessionToken(email, request);
      
      return NextResponse.json(
        {
          success: true,
          access_token: token,
          user: {
            id: 'superadmin-root-id',
            email: email,
            role: 'superadmin'
          }
        },
        { status: 200, headers: corsHeaders }
      );
    }

    const supabase = await createClient();
    
    // Fallback: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Authentication failed' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify they are an admin or superadmin
    const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
    if (role !== 'admin' && role !== 'superadmin') {
      // Sign out since they don't have privileges
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Forbidden: Requires admin privileges' },
        { status: 403, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role
        }
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || error}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
