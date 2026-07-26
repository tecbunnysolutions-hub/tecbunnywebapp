import { NextResponse } from 'next/server';
import { revokeSuperadminSessionToken } from '@tecbunny/core/server';
import { logger } from '@tecbunny/core/logger';

export async function POST(request: Request) {
  const tokenToClear = (request as any).cookies?.get?.('superadmin-session')?.value
    ?? (request.headers.get('cookie') || '').match(/superadmin-session=([^;]+)/)?.[1];

  logger.info('admin_auth.logout.requested', { hasToken: Boolean(tokenToClear) });

  if (tokenToClear) {
    await revokeSuperadminSessionToken(decodeURIComponent(tokenToClear)).catch((error) => {
      logger.warn('admin_auth.logout.revoke_failed', { error: error instanceof Error ? error.message : String(error) });
    });
  }

  const response = NextResponse.json({ success: true });
  
  // Clear the session cookie
  response.cookies.delete('superadmin-session');

  logger.info('admin_auth.logout.completed', { success: true });
  
  return response;
}
