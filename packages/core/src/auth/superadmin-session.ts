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

// Short-lived sessions for privileged access. Re-authentication required after expiry.
// For destructive operations (deletion, org changes, settings), step-up auth is required.
const SUPERADMIN_SESSION_TTL_SECONDS = 60 * 60 * 4; // 4 hours (reduced from 24h)

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

// Fingerprint binds the session to the User-Agent only.
// IP is intentionally excluded: IP addresses change legitimately on mobile,
// VPN, and dual-stack networks and cause spurious session invalidation.
async function generateFingerprint(requestOrIp: Request | string | null, uaStr?: string | null): Promise<string> {
  let ua = 'unknown';

  if (requestOrIp && typeof requestOrIp === 'object' && 'headers' in requestOrIp) {
    ua = requestOrIp.headers.get('user-agent') || 'unknown';
  } else {
    if (typeof uaStr === 'string') ua = uaStr;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', textEncoder.encode(ua));
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
  // v1 tokens are no longer accepted — all sessions must be v2.
  if (version !== 'v2' || !encodedPayload || !encodedSignature) {
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
    const configuredEmail = (process.env.SUPERADMIN_USER_ID || process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.sub !== 'superadmin-root-id' ||
      !payload.email ||
      payload.email.toLowerCase() !== configuredEmail ||
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
          reason: 'Token was generated for a different User-Agent',
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
      // In production, Redis is mandatory — do not fall back to memory
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Redis unavailable in production: cannot revoke superadmin session token');
      }
    }
  }
  // Development-only fallback to in-memory
  if (process.env.NODE_ENV !== 'production') {
    await logMessage('warn', 'superadmin_jti_revoke_memory_fallback', {
      reason: 'Redis unavailable in development; using memory fallback',
    });
    revokedJtisMemory.add(jti);
  }
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
    if (version !== 'v2' || !encodedPayload) return;

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

// Step-up authentication: for destructive superadmin operations, force re-verification.
// This creates a temporary elevated session that must be consumed within 5 minutes.
const SUPERADMIN_STEPUP_TTL_SECONDS = 5 * 60; // 5 minutes

export type StepUpAuthContext = {
  operation: 'delete_user' | 'delete_organization' | 'change_system_settings' | 'modify_billing' | 'reset_platform';
  resourceId?: string; // e.g., user ID, org ID
  requestedAt: number;
  expiresAt: number;
};

/**
 * Create a step-up authentication token.
 * Required for: user deletion, org deletion, system settings changes, billing changes, platform resets.
 * Must be verified with password before granting elevated access.
 */
export async function createSuperadminStepUpToken(
  email: string,
  operation: StepUpAuthContext['operation'],
  resourceId?: string
): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('SUPERADMIN_SESSION_SECRET or SESSION_SECRET is required');
  }

  const now = Math.floor(Date.now() / 1000);
  const stepUpData = {
    sub: 'superadmin-stepup',
    email,
    operation,
    resourceId: resourceId || null,
    iat: now,
    exp: now + SUPERADMIN_STEPUP_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };

  const encodedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify(stepUpData)));
  const signature = base64UrlEncode(await hmacSha256(encodedPayload, secret));
  return `stepup.${encodedPayload}.${signature}`;
}

/**
 * Verify a step-up authentication token.
 * Returns the operation context if valid, null otherwise.
 */
export async function verifySuperadminStepUpToken(token: string | undefined | null) {
  if (!token) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const [prefix, encodedPayload, encodedSignature] = token.split('.');
  if (prefix !== 'stepup' || !encodedPayload || !encodedSignature) {
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
    const payload = JSON.parse(payloadText) as Partial<StepUpAuthContext & { sub: string; email: string; exp: number; jti: string; iat: number }>;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.sub !== 'superadmin-stepup' ||
      !payload.email ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload as StepUpAuthContext & { email: string };
  } catch {
    return null;
  }
}

export { SUPERADMIN_SESSION_TTL_SECONDS };
