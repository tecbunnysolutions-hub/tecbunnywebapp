/**
 * PBKDF2-SHA256 password hashing for the superadmin credential.
 *
 * Operators generate a hash once (offline) and store it as
 * SUPERADMIN_PASSWORD_HASH in the environment. The plain-text
 * SUPERADMIN_PASSWORD is still accepted in development but is
 * rejected at login time in production.
 *
 * Hash format: pbkdf2v1:{iterations}:{base64url-salt}:{base64url-derived-key}
 *
 * To generate a hash, run the following in a Node REPL:
 *
 *   const { hashSuperadminPassword } = require('./dist/auth/superadmin-password');
 *   hashSuperadminPassword('your-new-password').then(console.log);
 *
 * or call the exported function from any server-side script.
 */

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEY_BYTES = 32;
const HASH_VERSION = 'pbkdf2v1';

const enc = new TextEncoder();

// btoa/atob are available everywhere crypto.subtle is (Node 16+, all browsers).
function b64uEncode(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64uDecode(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
  const bin = atob(padded);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return view;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
      keyMaterial,
      PBKDF2_KEY_BYTES * 8,
    ),
  );
}

/** Hash a password for storage in SUPERADMIN_PASSWORD_HASH. Call once offline. */
export async function hashSuperadminPassword(password: string): Promise<string> {
  const saltBuf = new ArrayBuffer(32);
  const salt = new Uint8Array(saltBuf);
  crypto.getRandomValues(salt);
  const derived = await deriveKey(password, salt as Uint8Array<ArrayBuffer>, PBKDF2_ITERATIONS);
  return `${HASH_VERSION}:${PBKDF2_ITERATIONS}:${b64uEncode(salt)}:${b64uEncode(derived)}`;
}

/**
 * Verify a submitted password against a stored PBKDF2 hash string.
 * Returns false for any malformed input; never throws.
 */
export async function verifySuperadminPassword(submitted: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 4 || parts[0] !== HASH_VERSION) return false;
    const iterations = parseInt(parts[1]!, 10);
    if (!Number.isFinite(iterations) || iterations < 100_000) return false;
    const salt = b64uDecode(parts[2]!);
    const expected = b64uDecode(parts[3]!);
    const derived = await deriveKey(submitted, salt, iterations);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
