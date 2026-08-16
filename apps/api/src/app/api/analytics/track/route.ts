import { isSupabasePublicConfigured } from "@tecbunny/core";
import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from "@tecbunny/core";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { insertEnterpriseEvent } from '../../../../lib/enterprise-analytics';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-VCCMTMSVP4';
const GA_API_SECRET = process.env.GA_API_SECRET;
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

type AnalyticsMetadata = Record<string, string | number | boolean | null>;

// ---------- event schema constraints ----------
// Event names must be snake_case, max 64 chars.
const EVENT_TYPE_RE = /^[a-z][a-z0-9_]{0,63}$/;
const MAX_URL_LENGTH = 2048;
const MAX_RESOURCE_ID_LENGTH = 128;
const MAX_SESSION_ID_LENGTH = 128;
/** Max metadata key count accepted per event. */
const MAX_METADATA_KEYS = 20;
const MAX_METADATA_KEY_LENGTH = 64;
const MAX_METADATA_VALUE_LENGTH = 512;
// -----------------------------------------------

function isFetchFailure(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const message = String((err as { message?: string }).message || '').toLowerCase();
  return message.includes('fetch failed');
}

function parseGaClientId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  const parts = value.split('.');
  if (parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}

// Client-provided sessionId is only stored as analytics metadata.
// The GA client_id is always resolved from the server-read _ga cookie or
// a fresh random value — never from a client-supplied field.
function getClientId(request: NextRequest) {
  const cookieClientId = parseGaClientId(request.headers.get('cookie'));
  if (cookieClientId) return cookieClientId;
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
}

function analyticsRequesterKey(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
  const ua = request.headers.get('user-agent')?.trim() || 'unknown';
  return `${ip}|${ua}`.slice(0, 240);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toAnalyticsMetadata(value: unknown): AnalyticsMetadata {
  if (!isPlainObject(value)) {
    return {};
  }

  let count = 0;
  return Object.entries(value).reduce<AnalyticsMetadata>((accumulator, [key, entry]) => {
    if (count >= MAX_METADATA_KEYS) return accumulator;
    if (key.length > MAX_METADATA_KEY_LENGTH) return accumulator;
    if (
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      entry === null
    ) {
      accumulator[key] = entry;
      count += 1;
    } else if (typeof entry === 'string' && entry.length <= MAX_METADATA_VALUE_LENGTH) {
      accumulator[key] = entry;
      count += 1;
    }
    return accumulator;
  }, {});
}

function resolveResourceId(resourceId: unknown, metadata: AnalyticsMetadata) {
  const candidates = [
    resourceId,
    metadata.resourceId,
    metadata.productId,
    metadata.serviceId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}

async function sendGaEvent(params: {
  clientId: string;
  userId?: string | null;
  eventType: string;
  pageUrl?: string | null;
  resourceId?: string | null;
  sessionId?: string | null;
  metadata?: AnalyticsMetadata;
}) {
  if (!GA_API_SECRET) {
    return;
  }

  const eventParams: Record<string, unknown> = {
    page_location: params.pageUrl ?? undefined,
    resource_id: params.resourceId ?? undefined,
    session_id: params.sessionId ?? undefined,
    ...params.metadata,
  };

  const payload = {
    client_id: params.clientId,
    user_id: params.userId ?? undefined,
    events: [
      {
        name: params.eventType,
        params: eventParams,
      },
    ],
  };

  const response = await fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    logger.warn('ga.measurement_protocol.failed', { status: response.status, body: text });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimit(`analytics:track:${analyticsRequesterKey(request)}`, 120, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    let body;
    try {
      body = await request.json();
    } catch (_e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    // Ensure body is an object to prevent destructuring failure
    if (!body || typeof body !== 'object') {
       return NextResponse.json({ success: true, skipped: 'Empty or invalid body' });
    }

    const {
      eventType,
      pageUrl,
      resourceId,
      metadata,
      sessionId,
      ...extraFields
    } = body as Record<string, unknown>;

    if (typeof eventType !== 'string' || !eventType.trim()) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }
    if (!EVENT_TYPE_RE.test(eventType)) {
      return NextResponse.json({ error: 'Invalid eventType format' }, { status: 400 });
    }

    const normalizedPageUrl = typeof pageUrl === 'string'
      ? pageUrl.slice(0, MAX_URL_LENGTH)
      : null;
    const normalizedResourceId = (() => {
      const raw = resolveResourceId(resourceId, toAnalyticsMetadata(metadata));
      return raw ? raw.slice(0, MAX_RESOURCE_ID_LENGTH) : null;
    })();
    const normalizedSessionId = typeof sessionId === 'string'
      ? sessionId.slice(0, MAX_SESSION_ID_LENGTH)
      : null;

    const eventMetadata = {
      ...toAnalyticsMetadata(metadata),
      ...toAnalyticsMetadata(extraFields),
    };

    const clientId = getClientId(request);
    let userId: string | null = null;

    try {
      await insertEnterpriseEvent(request, {
        ...extraFields,
        eventName: eventType,
        eventCategory: typeof extraFields.eventCategory === 'string' ? extraFields.eventCategory : 'feature_usage',
        application: typeof extraFields.application === 'string' ? extraFields.application : 'public',
        module: typeof extraFields.module === 'string' ? extraFields.module : 'website',
        screen: normalizedPageUrl,
        entityId: normalizedResourceId,
        sessionId: normalizedSessionId,
        metadata: eventMetadata,
      });
    } catch (enterpriseError) {
      logger.warn('Enterprise analytics ingestion failed', { error: enterpriseError });
    }

    if (isSupabasePublicConfigured()) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;

        if (user) {
          const { error } = await supabase
            .from('analytics_events')
            .insert({
              event_type: eventType,
              page_url: normalizedPageUrl,
              resource_id: normalizedResourceId,
              metadata: Object.keys(eventMetadata).length ? eventMetadata : null,
              session_id: normalizedSessionId,
              user_id: user.id,
            });

          // NOTE: inquiry events no longer create leads here.
          // Lead creation must go through the dedicated inquiry API endpoint
          // so that business records are always created from validated, explicit
          // user intent rather than from client-sent analytics payloads.
          if (eventType === 'amc_inquiry' || eventType === 'installation_inquiry') {
            logger.info('analytics.inquiry_event_received', {
              eventType,
              userId: user.id,
              resourceId: normalizedResourceId,
            });
          }

          if (error) {
            logger.warn('Failed to track analytics event', { error });
          }
        }
      } catch (sbError) {
        // Recover from Supabase errors so we can still track to GA or complete the request
        logger.warn('Supabase analytics tracking failed', { error: sbError });
      }
    }

    await sendGaEvent({
      clientId,
      userId,
      eventType,
      pageUrl: normalizedPageUrl,
      resourceId: normalizedResourceId,
      sessionId: normalizedSessionId,
      metadata: eventMetadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Swallow only transient GA network errors; surface all other failures so
    // monitoring can detect a systemically unavailable analytics pipeline.
    if (isFetchFailure(error)) {
      logger.warn('analytics.ga_send_failed', { error });
      return NextResponse.json({ success: true, skipped: 'GA delivery unavailable' });
    }

    logger.error('analytics.track.error', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
