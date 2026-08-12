import { NextResponse } from 'next/server';

// Temporary diagnostic endpoint — remove after login is confirmed working
export async function GET() {
  const userId = process.env.SUPERADMIN_USER_ID || '';
  const email = process.env.SUPERADMIN_EMAIL || '';
  const hasHash = !!process.env.SUPERADMIN_PASSWORD_HASH;
  const hasPlain = !!process.env.SUPERADMIN_PASSWORD;

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasUserId: !!userId,
    userIdPreview: userId ? `${userId.slice(0, 3)}***` : null,
    hasEmail: !!email,
    emailPreview: email ? `${email.slice(0, 3)}***` : null,
    hasPasswordHash: hasHash,
    hashPrefix: hasHash ? process.env.SUPERADMIN_PASSWORD_HASH!.slice(0, 12) : null,
    hasPlainPassword: hasPlain,
    effectiveIdentifier: (userId || email) ? `${(userId || email).slice(0, 3)}***` : null,
  });
}
