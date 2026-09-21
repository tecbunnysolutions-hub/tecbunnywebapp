import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

/**
 * Module 2 — Server-side Meta Conversions API (CAPI) handler.
 *
 * Receives events from the client pixel layer (`@/lib/meta/pixel`) and forwards
 * them to https://graph.facebook.com/v20.0/{PIXEL_ID}/events. The client sends
 * the SAME `event_id` it passed to `fbq('track', ..., { eventID })`, so Meta
 * deduplicates the browser and server events 1:1.
 *
 * Env (paste in apps/public/.env.local and your hosting dashboard):
 *   META_PIXEL_ID=1234567890123456        # same value as NEXT_PUBLIC_META_PIXEL_ID
 *   META_CAPI_ACCESS_TOKEN=EAAG...        # Events Manager -> Settings -> Conversions API -> Generate access token
 *
 * Event Match Quality: all PII (em, ph) is SHA-256 hashed AFTER lowercasing and
 * trimming, exactly per Meta's spec. client_ip_address, client_user_agent, fbp
 * and fbc are sent in plaintext (Meta requires them unhashed).
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GRAPH_API_VERSION = 'v20.0';
const CAPI_TIMEOUT_MS = 5000;

const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'AddToCart', 'Lead', 'Contact']);

interface ClientEventPayload {
  event_name?: unknown;
  event_id?: unknown;
  event_source_url?: unknown;
  user_data?: {
    email?: unknown;
    phone?: unknown;
    fbp?: unknown;
    fbc?: unknown;
  };
  custom_data?: Record<string, unknown>;
}

/** Meta spec: trim, lowercase, then SHA-256 hex. */
function hashUserValue(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase(), 'utf8').digest('hex');
}

/** Digits only; assumes India (+91) for 10-digit local numbers. */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.startsWith('00')) digits = digits.slice(2);
  return digits;
}

function firstForwardedIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || undefined;
}

function asNonEmptyString(value: unknown, maxLength = 512): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    logger.warn('meta_capi.not_configured', { hasPixelId: Boolean(pixelId), hasToken: Boolean(accessToken) });
    return NextResponse.json({ ok: false, error: 'Meta CAPI is not configured.' }, { status: 503 });
  }

  let body: ClientEventPayload;
  try {
    body = (await request.json()) as ClientEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const eventName = asNonEmptyString(body.event_name, 64);
  const eventId = asNonEmptyString(body.event_id, 128);
  if (!eventName || !ALLOWED_EVENTS.has(eventName) || !eventId) {
    return NextResponse.json({ ok: false, error: 'event_name and event_id are required.' }, { status: 400 });
  }

  // --- Build user_data for maximum Event Match Quality ---
  const userData: Record<string, string> = {};

  const email = asNonEmptyString(body.user_data?.email, 254);
  if (email) userData.em = hashUserValue(email);

  const phone = asNonEmptyString(body.user_data?.phone, 32);
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) userData.ph = hashUserValue(normalizedPhone);
  }

  const clientIp = firstForwardedIp(request);
  if (clientIp) userData.client_ip_address = clientIp;

  const clientUa = request.headers.get('user-agent');
  if (clientUa) userData.client_user_agent = clientUa;

  // Cookie values from the browser take precedence; fall back to the request
  // cookies so beacon/keepalive calls that omit them still match.
  const fbp = asNonEmptyString(body.user_data?.fbp) ?? request.cookies.get('_fbp')?.value;
  const fbc = asNonEmptyString(body.user_data?.fbc) ?? request.cookies.get('_fbc')?.value;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const eventSourceUrl = asNonEmptyString(body.event_source_url, 2048) ?? request.headers.get('referer') ?? undefined;

  const capiEvent = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website' as const,
    ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
    user_data: userData,
    ...(body.custom_data && typeof body.custom_data === 'object' ? { custom_data: body.custom_data } : {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPI_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [capiEvent] }),
        signal: controller.signal,
      },
    );

    const result = (await response.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string; code?: number };
    };

    if (!response.ok || result.error) {
      logger.error('meta_capi.dispatch_failed', {
        eventName,
        status: response.status,
        metaError: result.error?.message ?? null,
      });
      return NextResponse.json({ ok: false, error: 'Meta CAPI dispatch failed.' }, { status: 502 });
    }

    logger.info('meta_capi.dispatched', { eventName, eventsReceived: result.events_received ?? null });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('meta_capi.dispatch_exception', {
      eventName,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'Meta CAPI dispatch failed.' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
