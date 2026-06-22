import crypto from 'crypto';

type QuoteActionScope = 'quote_customer' | 'advance_payment';

type QuoteActionTokenPayload = {
  quoteId: string;
  scope: QuoteActionScope;
  exp: number;
  nonce: string;
};

const TOKEN_VERSION = 'v1';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 14;

function getQuoteActionSecret() {
  const secret = (
    process.env.QUOTE_ACTION_TOKEN_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.SUPERADMIN_SESSION_SECRET ||
    ''
  ).trim();

  if (!secret || secret.toLowerCase().includes('placeholder')) {
    throw new Error('[quote-action-token] QUOTE_ACTION_TOKEN_SECRET is required for secure customer quote actions.');
  }

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(encodedPayload: string) {
  return crypto
    .createHmac('sha256', getQuoteActionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  const maxLength = Math.max(leftBuffer.length, rightBuffer.length);
  const leftPadded = Buffer.alloc(maxLength);
  const rightPadded = Buffer.alloc(maxLength);
  leftBuffer.copy(leftPadded);
  rightBuffer.copy(rightPadded);
  return crypto.timingSafeEqual(leftPadded, rightPadded) && leftBuffer.length === rightBuffer.length;
}

export function createQuoteActionToken(
  quoteId: string,
  scope: QuoteActionScope,
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: QuoteActionTokenPayload = {
    quoteId,
    scope,
    exp: now + ttlSeconds,
    nonce: crypto.randomUUID(),
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

export function verifyQuoteActionToken(
  token: unknown,
  quoteId: string,
  allowedScopes: QuoteActionScope[]
) {
  if (typeof token !== 'string' || !token.trim()) {
    return false;
  }

  const [version, encodedPayload, signature] = token.split('.');
  if (version !== TOKEN_VERSION || !encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<QuoteActionTokenPayload>;
    const now = Math.floor(Date.now() / 1000);
    return (
      payload.quoteId === quoteId &&
      typeof payload.exp === 'number' &&
      payload.exp > now &&
      typeof payload.scope === 'string' &&
      allowedScopes.includes(payload.scope as QuoteActionScope)
    );
  } catch {
    return false;
  }
}
