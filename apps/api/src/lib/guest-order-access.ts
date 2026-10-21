import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error('Guest order access signing is not configured');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createGuestOrderAccessToken(orderId: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({
    orderId,
    exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
  })).toString('base64url');
  return `v1.${payload}.${sign(payload)}`;
}

export function verifyGuestOrderAccessToken(
  token: string | null | undefined,
  orderId: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [version, payload, signature, extra] = token.split('.');
  if (version !== 'v1' || !payload || !signature || extra !== undefined) return false;

  try {
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      orderId?: unknown;
      exp?: unknown;
    };
    return decoded.orderId === orderId &&
      typeof decoded.exp === 'number' &&
      decoded.exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}
