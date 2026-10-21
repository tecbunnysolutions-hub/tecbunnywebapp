import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

export function getInternalApiSecret(): string | undefined {
  return process.env.INTERNAL_API_KEY || process.env.INTERNAL_API_TOKEN || process.env.CRON_SECRET;
}

export function hasInternalAccess(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const secret = getInternalApiSecret();
  const provided = request.headers.get('x-internal-api-key') || request.headers.get('x-internal-api-token');
  if (!secret || !provided) return false;

  const expectedBytes = Buffer.from(secret);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

let warnedLegacyInternalKey = false;

// INTERNAL_API_TOKEN is canonical; INTERNAL_API_KEY is a deprecated fallback.
export function getInternalToken(): string | undefined {
  if (process.env.INTERNAL_API_TOKEN) return process.env.INTERNAL_API_TOKEN;
  if (process.env.INTERNAL_API_KEY) {
    if (!warnedLegacyInternalKey) {
      warnedLegacyInternalKey = true;
      console.warn('[env] INTERNAL_API_KEY is deprecated; use INTERNAL_API_TOKEN');
    }
    return process.env.INTERNAL_API_KEY;
  }
  return undefined;
}

/** Strict server-to-server check: no development bypass, no CRON_SECRET fallback, constant-time compare. */
export function hasInternalToken(request: NextRequest): boolean {
  const secret = getInternalToken();
  const provided = request.headers.get('x-internal-api-token') || request.headers.get('x-internal-api-key');
  if (!secret || !provided) return false;

  const expectedBytes = Buffer.from(secret);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export function requireInternalAccess(request: NextRequest) {
  return hasInternalAccess(request)
    ? null
    : NextResponse.json({ error: 'Not Found' }, { status: 404 });
}