import { NextResponse } from 'next/server';
import { getRedis } from '@tecbunny/core/redis';

const DEFAULT_WEBHOOK_MAX_BODY_BYTES = 262144;
const DEFAULT_IDEMPOTENCY_TTL_SECONDS = 86400;

function webhookMaxBodyBytes() {
  const configured = Number(process.env.WEBHOOK_MAX_BODY_BYTES);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.floor(configured);
  }
  return DEFAULT_WEBHOOK_MAX_BODY_BYTES;
}

export function isObjectPayload(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function getWebhookTimestampHeader(request: Request) {
  return request.headers.get('x-webhook-timestamp') || request.headers.get('x-payu-timestamp');
}

// In-memory fallback used when Redis is unavailable (per-instance, TTL-bound).
const localClaims = new Map<string, number>();

function claimLocally(key: string) {
  const now = Date.now();
  for (const [k, expiresAt] of localClaims) {
    if (expiresAt <= now) localClaims.delete(k);
  }
  if (localClaims.has(key)) return false;
  localClaims.set(key, now + DEFAULT_IDEMPOTENCY_TTL_SECONDS * 1000);
  return true;
}

export async function claimWebhookEventId(prefix: string, eventId: string) {
  const key = `${prefix}:${eventId}`;
  const redis = getRedis();
  if (!redis) {
    return claimLocally(key);
  }

  try {
    const claimed = await redis.set(key, 'processing', 'EX', DEFAULT_IDEMPOTENCY_TTL_SECONDS, 'NX');
    return Boolean(claimed);
  } catch {
    return claimLocally(key);
  }
}

export async function readWebhookJsonBody(request: Request) {
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > webhookMaxBodyBytes()) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Payload too large' }, { status: 413 }),
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }

  if (!isObjectPayload(body)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Invalid payload shape' }, { status: 400 }),
    };
  }

  return {
    ok: true as const,
    rawBody,
    body,
  };
}
