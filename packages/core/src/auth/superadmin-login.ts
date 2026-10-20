import { rateLimit } from '../rate-limit';
import { verifySuperadminPassword } from './superadmin-password';

/**
 * Single entry point for every superadmin (root console) credential check.
 *
 * - Reads only SUPERADMIN_USER_ID, SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD_HASH.
 *   No plaintext password variable is read.
 * - The identifier is compared in constant time; the password is verified against
 *   the PBKDF2 hash (constant-time compare inside verifySuperadminPassword).
 * - Attempts are rate limited per client IP and per identifier.
 */

export type SuperadminLoginFailure = 'not_configured' | 'rate_limited' | 'id_mismatch' | 'invalid_password';

export type SuperadminLoginResult =
  | { ok: true; userId: string }
  | { ok: false; reason: SuperadminLoginFailure };

export interface SuperadminLoginOptions {
  identifier: string;
  password: string;
  ip: string;
  /** 'primary' = SUPERADMIN_USER_ID, falling back to SUPERADMIN_EMAIL. 'any' = either one. */
  identity?: 'primary' | 'any';
  caseSensitive?: boolean;
  /** When true an identifier mismatch returns immediately (caller continues with another login flow). */
  fallThrough?: boolean;
  rateLimit?: { scope: string; limit: number; windowMs: number };
}

const DEFAULT_RATE_LIMIT = { scope: 'superadmin_login', limit: 5, windowMs: 15 * 60 * 1000 };
const encoder = new TextEncoder();

export function constantTimeStringEquals(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return diff === 0;
}

export function getSuperadminLoginConfig() {
  const userId = (process.env.SUPERADMIN_USER_ID || '').trim();
  const email = (process.env.SUPERADMIN_EMAIL || '').trim();
  const passwordHash = process.env.SUPERADMIN_PASSWORD_HASH || '';
  return { userId, email, passwordHash, configured: Boolean(passwordHash && (userId || email)) };
}

export async function verifySuperadminLogin(options: SuperadminLoginOptions): Promise<SuperadminLoginResult> {
  const config = getSuperadminLoginConfig();
  if (!config.configured) return { ok: false, reason: 'not_configured' };

  const identifier = options.identifier.trim();
  const candidates = options.identity === 'any'
    ? [config.userId, config.email].filter(Boolean)
    : [config.userId || config.email];
  const normalize = (value: string) => (options.caseSensitive ? value : value.toLowerCase());
  const matched = candidates.find((candidate) => constantTimeStringEquals(normalize(identifier), normalize(candidate)));

  if (!matched && options.fallThrough) return { ok: false, reason: 'id_mismatch' };

  const limits = options.rateLimit ?? DEFAULT_RATE_LIMIT;
  const byIp = await rateLimit(`${limits.scope}_ip:${options.ip}`, limits.limit, limits.windowMs);
  const byId = await rateLimit(`${limits.scope}_user:${identifier.toLowerCase()}`, limits.limit, limits.windowMs);
  if (!byIp.allowed || !byId.allowed) return { ok: false, reason: 'rate_limited' };

  // Always run the hash check so an unknown identifier costs the same as a wrong password.
  const passwordOk = await verifySuperadminPassword(options.password, config.passwordHash);
  if (!matched) return { ok: false, reason: 'id_mismatch' };
  if (!passwordOk) return { ok: false, reason: 'invalid_password' };
  return { ok: true, userId: matched };
}
