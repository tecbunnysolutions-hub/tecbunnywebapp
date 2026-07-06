import { NextResponse } from 'next/server';
import { createSuperadminSessionToken } from '@tecbunny/core/server';

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    const expectedUserId = process.env.SUPERADMIN_USER_ID;
    const expectedPassword = process.env.SUPERADMIN_PASSWORD;

    if (!expectedUserId || !expectedPassword) {
      return NextResponse.json(
        { error: 'Superadmin credentials are not configured in the environment' },
        { status: 500 }
      );
    }

    if (userId === expectedUserId && password === expectedPassword) {
      const token = await createSuperadminSessionToken(userId);

      const response = NextResponse.json({ success: true });
      
      // Set the session cookie securely
      response.cookies.set('superadmin-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid superadmin credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
