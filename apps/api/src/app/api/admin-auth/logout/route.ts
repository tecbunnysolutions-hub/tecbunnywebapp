import { NextResponse } from 'next/server';
import { revokeSuperadminSessionToken } from '@tecbunny/core/server';

export async function POST(request: Request) {
  const tokenToClear = (request as any).cookies?.get?.('superadmin-session')?.value
    ?? (request.headers.get('cookie') || '').match(/superadmin-session=([^;]+)/)?.[1];

  if (tokenToClear) {
    await revokeSuperadminSessionToken(decodeURIComponent(tokenToClear)).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  
  // Clear the session cookie
  response.cookies.delete('superadmin-session');
  
  return response;
}
