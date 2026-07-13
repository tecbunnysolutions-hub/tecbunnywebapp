import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/core/supabase/server';

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

    const supabase = await createClient();
    
    // Authenticate with Supabase
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
