import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-webmail-key-for-dev'
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Lookup the user
    const { data: account, error } = await supabase
      .from('webmail_accounts')
      .select('id, email, password_hash, active')
      .eq('email', email)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!account.active) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await supabase
      .from('webmail_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', account.id);

    // Create session token
    const token = await new SignJWT({
      accountId: account.id,
      email: account.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('webmail_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({ success: true, email: account.email });
  } catch (err: any) {
    console.error('Webmail login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
