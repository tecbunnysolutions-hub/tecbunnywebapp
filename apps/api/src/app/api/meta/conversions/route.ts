import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GRAPH_API_VERSION = 'v20.0';
const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'AddToCart', 'Lead', 'Contact']);

type EventBody = {
  event_name?: unknown;
  event_id?: unknown;
  event_source_url?: unknown;
  user_data?: { email?: unknown; phone?: unknown; fbp?: unknown; fbc?: unknown };
  custom_data?: Record<string, unknown>;
};

function stringValue(value: unknown, max = 512) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

function hash(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase(), 'utf8').digest('hex');
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return NextResponse.json({ ok: false, error: 'Meta CAPI is not configured.' }, { status: 503 });

  let body: EventBody;
  try { body = await request.json() as EventBody; } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 }); }
  const eventName = stringValue(body.event_name, 64);
  const eventId = stringValue(body.event_id, 128);
  if (!eventName || !eventId || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: 'event_name and event_id are required.' }, { status: 400 });
  }

  const email = stringValue(body.user_data?.email, 254);
  const rawPhone = stringValue(body.user_data?.phone, 32);
  const phone = rawPhone?.replace(/\D/g, '');
  const normalizedPhone = phone?.length === 10 ? `91${phone}` : phone?.replace(/^00/, '');
  const userData: Record<string, string> = {};
  if (email) userData.em = hash(email);
  if (normalizedPhone) userData.ph = hash(normalizedPhone);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim();
  if (ip) userData.client_ip_address = ip;
  const userAgent = request.headers.get('user-agent');
  if (userAgent) userData.client_user_agent = userAgent;
  const fbp = stringValue(body.user_data?.fbp) || request.cookies.get('_fbp')?.value;
  const fbc = stringValue(body.user_data?.fbc) || request.cookies.get('_fbc')?.value;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ data: [{ event_name: eventName, event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: 'website', event_source_url: stringValue(body.event_source_url, 2048) || request.headers.get('referer') || undefined, user_data: userData, custom_data: body.custom_data }] }),
    });
    const result = await response.json().catch(() => ({})) as { error?: { message?: string } };
    if (!response.ok || result.error) {
      logger.error('meta_capi.dispatch_failed', { eventName, status: response.status, error: result.error?.message });
      return NextResponse.json({ ok: false, error: 'Meta CAPI dispatch failed.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('meta_capi.dispatch_exception', { eventName, error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, error: 'Meta CAPI dispatch failed.' }, { status: 502 });
  } finally { clearTimeout(timeout); }
}
