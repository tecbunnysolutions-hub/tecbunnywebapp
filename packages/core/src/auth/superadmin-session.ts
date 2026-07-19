async function logMessage(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge') {
    const { logger: browserLogger } = await import('../logger-browser');
    browserLogger[level](message, meta);
  } else {
    try {
      const { logger: nodeLogger } = await import('../logger');
      nodeLogger[level](message, meta);
    } catch {
      const { logger: browserLogger } = await import('../logger-browser');
      browserLogger[level](message, meta);
    }
  }
}

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
    console.error('SUPERADMIN_SESSION_SECRET or SESSION_SECRET is not configured. Superadmin session operations will fail.');
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

async function resolveFingerprintContext(requestOrIp?: Request | string | null, uaStr?: string | null) {
  if (requestOrIp || uaStr) {
    return { requestOrIp: requestOrIp || null, uaStr: uaStr || null };
  }

  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return {
      requestOrIp: headersList.get('x-forwarded-for') || 'unknown',
      uaStr: headersList.get('user-agent') || 'unknown',
    };
  } catch {
    return null;
  }
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
      (payload.jti && await isJtiRevoked(payload.jti))
    ) {
      return null;
    }

    // Fingerprint verification is mandatory for v2 tokens. Older call sites that
    // omit explicit context are handled by resolving Next.js request headers here.
    if (version === 'v2') {
      const fingerprintContext = await resolveFingerprintContext(requestOrIp, uaStr);
      if (!fingerprintContext) {
        await logMessage('warn', 'superadmin_session_fingerprint_context_missing', {
          reason: 'v2 token verification requires request IP and User-Agent context',
        });
        return null;
      }

      const currentFp = await generateFingerprint(fingerprintContext.requestOrIp, fingerprintContext.uaStr);
      if (payload.fp !== currentFp) {
        await logMessage('warn', 'superadmin_session_fingerprint_mismatch', { 
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

// JTI blocklist backed by Redis for multi-instance deployments.
// Falls back to in-memory for single-instance / development use.
// In production, REDIS_URL must be set so revoked tokens are shared across
// all serverless instances and survive cold starts.
const revokedJtisMemory = new Set<string>();
const REVOKED_JTI_KEY_PREFIX = 'superadmin_revoked_jti:';

async function addRevokedJti(jti: string): Promise<void> {
  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME !== 'edge') {
    try {
      const { getRedis } = await import('../redis');
      const redis = getRedis();
      if (redis) {
        await redis.set(
          `${REVOKED_JTI_KEY_PREFIX}${jti}`,
          '1',
          'EX',
          SUPERADMIN_SESSION_TTL_SECONDS
        );
        return;
      }
    } catch (err) {
      await logMessage('error', 'superadmin_jti_revoke_redis_failed', { jti, error: (err as Error).message });
      // fall through to memory
    }
  }
  if (process.env.NODE_ENV === 'production') {
    await logMessage('warn', 'superadmin_jti_revoke_memory_fallback', {
      reason: 'Redis unavailable; JTI revocation is NOT durable across cold starts',
    });
  }
  revokedJtisMemory.add(jti);
}

async function checkJtiRevoked(jti: string): Promise<boolean> {
  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME !== 'edge') {
    try {
      const { getRedis } = await import('../redis');
      const redis = getRedis();
      if (redis) {
        const val = await redis.get(`${REVOKED_JTI_KEY_PREFIX}${jti}`);
        return val !== null;
      }
    } catch {
      // Redis error — fall through to memory check
    }
  }
  return revokedJtisMemory.has(jti);
}

export async function revokeSuperadminSessionToken(token: string): Promise<void> {
  try {
    const [version, encodedPayload] = token.split('.');
    if ((version !== 'v1' && version !== 'v2') || !encodedPayload) return;

    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<SuperadminSessionPayload>;

    if (payload.jti) {
      await addRevokedJti(payload.jti);
      await logMessage('info', 'Superadmin session JTI revoked', { jti: payload.jti });
    }
  } catch {
    await logMessage('warn', 'Failed to parse token for revocation — treating as already invalid.');
  }
}

/**
 * Checks whether a JTI has been explicitly revoked.
 * Checks Redis first, falls back to in-memory.
 */
async function isJtiRevoked(jti: string): Promise<boolean> {
  return checkJtiRevoked(jti);
}

export { SUPERADMIN_SESSION_TTL_SECONDS };
