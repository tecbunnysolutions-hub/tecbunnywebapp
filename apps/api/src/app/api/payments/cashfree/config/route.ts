import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';

/**
 * Cashfree credentials are managed through deployment environment variables
 * (CASHFREE_ENV, CASHFREE_{SANDBOX,PROD}_APP_ID, CASHFREE_{SANDBOX,PROD}_SECRET_KEY).
 * Runtime edits were written to a local file that other instances never saw
 * and that read-only deployments cannot write, so this endpoint only reports
 * the active configuration.
 */
async function requireSuperadmin(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get('superadmin-session')?.value;
  return !!(await verifySuperadminSessionToken(cookie));
}

export async function GET(request: NextRequest) {
  if (!(await requireSuperadmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    environment: process.env.CASHFREE_ENV || 'sandbox',
    has_sandbox_creds: !!process.env.CASHFREE_SANDBOX_APP_ID,
    has_prod_creds: !!process.env.CASHFREE_PROD_APP_ID,
    managed_by: 'environment',
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSuperadmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(
    { error: 'Cashfree credentials are managed via deployment environment variables. Update them there and redeploy.' },
    { status: 405 },
  );
}

export const runtime = 'nodejs';
