import speakeasy from 'speakeasy';

import { logger } from '../logger';
import { rateLimit } from '../rate-limit';
import { verifySuperadminPassword } from './superadmin-password';

export type SuperadminLoginResult =
  | { ok: true; email: string }
  | { ok: false; status: number; error: string };

const WINDOW_MS = 15 * 60 * 1000;
const PER_CLIENT_LIMIT = 5;
const PER_IDENTIFIER_LIMIT = 5;
// All root login surfaces together; bounds distributed guessing.
const GLOBAL_LIMIT = 30;

const textEncoder = new TextEncoder();

function constantTimeEquals(left: string, right: string) {
  const a = textEncoder.encode(left);
  const b = textEncoder.encode(right);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Canonical identity embedded in root sessions. Must match the value
 * verifySuperadminSessionToken compares against.
 */
export function configuredSuperadminIdentity(): string {
  return (process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL || '').trim();
}

/**
 * Single credential check for every root (superadmin) login surface: shared
 * attempt limits, PBKDF2 password verification and, when
 * SUPERADMIN_TOTP_SECRET is configured, a required authenticator code.
 */
export async function verifySuperadminLogin(input: {
  identifier: string;
  password: string;
  otp?: string | null;
  clientKey: string;
}): Promise<SuperadminLoginResult> {
  const identifier = input.identifier.trim().toLowerCase();
  const tooMany = { ok: false as const, status: 429, error: 'Too many login attempts. Please try again later.' };

  const limits = await Promise.all([
    rateLimit(`superadmin_login_client:${input.clientKey}`, PER_CLIENT_LIMIT, WINDOW_MS),
    rateLimit(`superadmin_login_identifier:${identifier || 'empty'}`, PER_IDENTIFIER_LIMIT, WINDOW_MS),
    rateLimit('superadmin_login_global', GLOBAL_LIMIT, WINDOW_MS),
  ]);
  if (limits.some((result) => !result.allowed)) {
    logger.warn('superadmin_login.rate_limited', { clientKey: input.clientKey });
    return tooMany;
  }

  const canonical = configuredSuperadminIdentity();
  const allowedIdentifiers = [process.env.SUPERADMIN_USER_ID, process.env.SUPERADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);
  const passwordHash = process.env.SUPERADMIN_PASSWORD_HASH;
  const developmentPassword = process.env.SUPERADMIN_PASSWORD;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!canonical || (!passwordHash && (isProduction || !developmentPassword))) {
    logger.error('superadmin_login.configuration_missing', { hasIdentity: Boolean(canonical), hasHash: Boolean(passwordHash) });
    return { ok: false, status: 503, error: 'Superadmin credentials are not configured on the server.' };
  }

  const identifierMatches = allowedIdentifiers.some((candidate) => constantTimeEquals(identifier, candidate));
  const passwordMatches = passwordHash
    ? await verifySuperadminPassword(input.password, passwordHash)
    : !isProduction && constantTimeEquals(input.password, developmentPassword!);

  if (!identifierMatches || !passwordMatches) {
    logger.warn('superadmin_login.invalid_credentials', { clientKey: input.clientKey });
    return { ok: false, status: 401, error: 'Invalid superadmin credentials.' };
  }

  const totpSecret = process.env.SUPERADMIN_TOTP_SECRET?.trim();
  if (totpSecret) {
    const code = (input.otp || '').replace(/\s/g, '');
    const validCode = /^\d{6}$/.test(code) && speakeasy.totp.verify({ secret: totpSecret, encoding: 'base32', token: code, window: 1 });
    if (!validCode) {
      logger.warn('superadmin_login.invalid_second_factor', { clientKey: input.clientKey });
      return { ok: false, status: 401, error: 'A valid authenticator code is required.' };
    }
    // Each code is accepted once (Redis-backed when configured).
    const firstUse = await rateLimit(`superadmin_login_totp:${code}`, 1, 2 * 60 * 1000);
    if (!firstUse.allowed) {
      return { ok: false, status: 401, error: 'This authenticator code was already used.' };
    }
  } else if (isProduction) {
    logger.warn('superadmin_login.second_factor_not_configured', {
      remedy: 'Set SUPERADMIN_TOTP_SECRET to require an authenticator code for root logins.',
    });
  }

  return { ok: true, email: canonical };
}
