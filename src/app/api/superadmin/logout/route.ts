import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  
  // Clear the superadmin session cookie
  response.cookies.set('superadmin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  response.cookies.set('tb-superadmin-active', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  // SECURITY: Force browser to clear sensitive data on signout
  response.headers.set('Clear-Site-Data', '"cookies", "storage", "cache"');
  
  return response;
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/superadmin/login?error=logout_requires_post', request.url));
}
