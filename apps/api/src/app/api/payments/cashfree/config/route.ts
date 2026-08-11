import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadminSessionToken } from '@tecbunny/core/server';
import { logger } from '@tecbunny/core';

const ENV_FILE = path.resolve(process.cwd(), '.env.cashfree');

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseEnvFile(): Record<string, string> {
  try {
    const lines = fs.readFileSync(ENV_FILE, 'utf8').split('\n');
    return Object.fromEntries(
      lines
        .map((l: string) => l.trim())
        .filter((l: string) => l && !l.startsWith('#'))
        .map((l: string) => {
          const eq = l.indexOf('=');
          if (eq < 0) return null;
          return [l.slice(0, eq).trim(), l.slice(eq + 1).trim().replace(/^["']|["']$/g, '')];
        })
        .filter(Boolean) as [string, string][]
    );
  } catch {
    return {};
  }
}

function writeEnvFile(vars: Record<string, string>): void {
  const content = [
    `# Cashfree Payment Gateway — updated ${new Date().toISOString()}`,
    '',
    `CASHFREE_ENV="${vars.CASHFREE_ENV ?? 'sandbox'}"`,
    '',
    `CASHFREE_SANDBOX_APP_ID="${vars.CASHFREE_SANDBOX_APP_ID ?? ''}"`,
    `CASHFREE_SANDBOX_SECRET_KEY="${vars.CASHFREE_SANDBOX_SECRET_KEY ?? ''}"`,
    '',
    `CASHFREE_PROD_APP_ID="${vars.CASHFREE_PROD_APP_ID ?? ''}"`,
    `CASHFREE_PROD_SECRET_KEY="${vars.CASHFREE_PROD_SECRET_KEY ?? ''}"`,
  ].join('\n') + '\n';

  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

async function requireSuperadmin(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get('superadmin-session')?.value;
  return !!(await verifySuperadminSessionToken(cookie));
}

// ─── routes ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await requireSuperadmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const file = parseEnvFile();
  const environment = file.CASHFREE_ENV || process.env.CASHFREE_ENV || 'sandbox';

  return NextResponse.json({
    environment,
    has_sandbox_creds: !!(file.CASHFREE_SANDBOX_APP_ID || process.env.CASHFREE_SANDBOX_APP_ID),
    has_prod_creds: !!(file.CASHFREE_PROD_APP_ID || process.env.CASHFREE_PROD_APP_ID),
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSuperadmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { environment, sandbox_app_id, sandbox_secret_key, prod_app_id, prod_secret_key } = body;

  if (environment !== undefined && environment !== 'sandbox' && environment !== 'production') {
    return NextResponse.json(
      { error: 'environment must be "sandbox" or "production"' },
      { status: 422 }
    );
  }

  const vars = parseEnvFile();

  if (environment !== undefined) vars.CASHFREE_ENV = environment;
  if (sandbox_app_id !== undefined) vars.CASHFREE_SANDBOX_APP_ID = sandbox_app_id;
  if (sandbox_secret_key !== undefined) vars.CASHFREE_SANDBOX_SECRET_KEY = sandbox_secret_key;
  if (prod_app_id !== undefined) vars.CASHFREE_PROD_APP_ID = prod_app_id;
  if (prod_secret_key !== undefined) vars.CASHFREE_PROD_SECRET_KEY = prod_secret_key;

  writeEnvFile(vars);

  // Reflect changes in the running process immediately
  if (environment !== undefined) process.env.CASHFREE_ENV = environment;
  if (sandbox_app_id !== undefined) process.env.CASHFREE_SANDBOX_APP_ID = sandbox_app_id;
  if (sandbox_secret_key !== undefined) process.env.CASHFREE_SANDBOX_SECRET_KEY = sandbox_secret_key;
  if (prod_app_id !== undefined) process.env.CASHFREE_PROD_APP_ID = prod_app_id;
  if (prod_secret_key !== undefined) process.env.CASHFREE_PROD_SECRET_KEY = prod_secret_key;

  logger.info('cashfree.config.updated', {
    environment: vars.CASHFREE_ENV,
    fields_updated: Object.keys(body),
    by: 'superadmin',
  });

  return NextResponse.json({
    environment: vars.CASHFREE_ENV,
    has_sandbox_creds: !!vars.CASHFREE_SANDBOX_APP_ID,
    has_prod_creds: !!vars.CASHFREE_PROD_APP_ID,
  });
}

export const runtime = 'nodejs';
