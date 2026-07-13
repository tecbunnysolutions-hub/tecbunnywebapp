import { logger } from '../logger';

const SUPERADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24;

type SuperadminSessionPayload = {
  sub: 'superadmin-root-id';
  email: string;
  iat: number;
  exp: number;
  jti: string;
  fp: string; // Fingerprint
};

const textEncoder = new TextEncoder();

let cachedKeySecret: string | null = null;
let cachedCryptoKey: CryptoKey | null = null;

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = typeof atob === 'function'
    ? atob(padded)
    : Buffer.from(padded, 'base64').toString('binary');
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getSessionSecret() {
  const secret = process.env.SUPERADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    logger.error('SUPERADMIN_SESSION_SECRET or SESSION_SECRET is not configured. Superadmin session operations will fail.');
    return null;
  }
  return secret;
}

async function hmacSha256(data: string, secret: string) {
  if (!cachedCryptoKey || cachedKeySecret !== secret) {
    cachedCryptoKey = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    cachedKeySecret = secret;
  }
  return new Uint8Array(await crypto.subtle.sign('HMAC', cachedCryptoKey, textEncoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

// Generate a request fingerprint hash combining IP and User-Agent
async function generateFingerprint(requestOrIp: Request | string | null, uaStr?: string | null): Promise<string> {
  let ip = 'unknown';
  let ua = 'unknown';

  if (requestOrIp && typeof requestOrIp === 'object' && 'headers' in requestOrIp) {
    ip = requestOrIp.headers.get('x-forwarded-for') || 'unknown';
    ua = requestOrIp.headers.get('user-agent') || 'unknown';
  } else {
    if (typeof requestOrIp === 'string') ip = requestOrIp;
    if (typeof uaStr === 'string') ua = uaStr;
  }

  const rawFp = `${ip.split(',')[0].trim()}|${ua}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', textEncoder.encode(rawFp));
  return base64UrlEncode(new Uint8Array(hashBuffer)).substring(0, 16);
}

export async function createSuperadminSessionToken(email: string, requestOrIp: Request | string, ua?: string) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('SUPERADMIN_SESSION_SECRET or SUPERADMIN_PASSWORD is required');
  }

  const now = Math.floor(Date.now() / 1000);
  const fp = await generateFingerprint(requestOrIp, ua);
  
  const payload: SuperadminSessionPayload = {
    sub: 'superadmin-root-id',
    email,
    iat: now,
    exp: now + SUPERADMIN_SESSION_TTL_SECONDS,
    jti: crypto.randomUUID(),
    fp,
  };

  const encodedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));
  const signature = base64UrlEncode(await hmacSha256(encodedPayload, secret));
  return `v2.${encodedPayload}.${signature}`;
}

export async function verifySuperadminSessionToken(token: string | undefined | null, requestOrIp?: Request | string | null, uaStr?: string | null) {
  if (!token) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const [version, encodedPayload, encodedSignature] = token.split('.');
  // Support v1 tokens during migration, but ideally only accept v2
  if ((version !== 'v1' && version !== 'v2') || !encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = await hmacSha256(encodedPayload, secret);
  let actualSignature: Uint8Array;
  try {
    actualSignature = base64UrlDecode(encodedSignature);
  } catch {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, actualSignature)) return null;

  try {
    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<SuperadminSessionPayload>;
    const configuredEmail = process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.sub !== 'superadmin-root-id' ||
      !payload.email ||
      payload.email !== configuredEmail ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now ||
      (payload.jti && isJtiRevoked(payload.jti))
    ) {
      return null;
    }

    // Fingerprint verification for v2 tokens
    if (version === 'v2' && (requestOrIp || uaStr)) {
      const currentFp = await generateFingerprint(requestOrIp || null, uaStr);
      if (payload.fp !== currentFp) {
        logger.warn('superadmin_session_fingerprint_mismatch', { 
          reason: 'Token was generated for a different IP or User-Agent',
          expectedFp: payload.fp,
          actualFp: currentFp
        });
        return null;
      }
    }

    return payload as SuperadminSessionPayload;
  } catch {
    return null;
  }
}

// Bug #23 fix: In-memory JTI blocklist for the current process lifetime.
// This prevents a stolen token from being reused until it naturally expires,
// even if the attacker still holds the cookie value.
// For multi-instance deployments, replace this with a Redis SET with TTL equal
// to SUPERADMIN_SESSION_TTL_SECONDS.
const revokedJtis = new Set<string>();

export async function revokeSuperadminSessionToken(token: string): Promise<void> {
  try {
    const [version, encodedPayload] = token.split('.');
    if (version !== 'v1' || !encodedPayload) return;

    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<SuperadminSessionPayload>;

    if (payload.jti) {
      revokedJtis.add(payload.jti);
      logger.info('Superadmin session JTI revoked', { jti: payload.jti });
    }
  } catch {
    logger.warn('Failed to parse token for revocation — treating as already invalid.');
  }
}

/**
 * Checks whether a JTI has been explicitly revoked in this process.
 * Called internally by verifySuperadminSessionToken.
 */
function isJtiRevoked(jti: string): boolean {
  return revokedJtis.has(jti);
}

export { SUPERADMIN_SESSION_TTL_SECONDS };
