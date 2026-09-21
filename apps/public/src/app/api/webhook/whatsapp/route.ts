import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getWabaWebhookQueue } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core/logger';
import { sendWhatsAppTextMessage } from '@tecbunny/core/whatsapp-cloud-api';

/**
 * Meta WhatsApp Cloud API webhook receiver for the public storefront domain.
 *
 * This mirrors the dual-provider handler in apps/waba so Meta can deliver
 * events to https://www.tecbunny.com/api/webhook/whatsapp without a separate
 * waba subdomain. Both endpoints share the same env contract and queue.
 *
 * Env (paste in apps/public/.env.local and your hosting dashboard):
 *   META_APP_SECRET=...                 # App Dashboard -> Settings -> Basic -> App Secret
 *   META_WHATSAPP_VERIFY_TOKEN=...      # random string you invent; same value in Meta webhook config
 *   WHATSAPP_TOKEN=...                  # System User token (whatsapp_business_messaging)
 *   WHATSAPP_PHONE_NUMBER_ID=...        # WhatsApp -> API Setup -> Phone number ID
 *   META_WHATSAPP_AUTO_REPLY=true       # optional: enable the fire-and-forget auto-reply
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function verifySignature(payload: Buffer, signature: string, secret: string | undefined): boolean {
  if (!secret) {
    console.error('WhatsApp webhook signing secret is required but not set.');
    return false;
  }

  const clean = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  const expectedHex = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedHex, 'utf8');
    const actualBuf = Buffer.from(clean, 'utf8');
    return expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

function hashPhone(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return crypto.createHash('sha256').update(value.trim()).digest('hex').slice(0, 16);
}

/**
 * Meta webhook verification handshake. Meta calls this with
 * hub.mode=subscribe, hub.verify_token and hub.challenge when the webhook
 * is configured in the app dashboard.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && challenge && verifyToken && token === verifyToken) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBodyBuffer = Buffer.from(await req.arrayBuffer());
    const rawBody = rawBodyBuffer.toString('utf8');
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const signature = req.headers.get('x-hub-signature-256');

    if (!signature) {
      return NextResponse.json({ error: 'Missing X-Hub-Signature-256 header' }, { status: 401 });
    }
    if (!verifySignature(rawBodyBuffer, signature, process.env.META_APP_SECRET)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
      entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ id?: string; from?: string; text?: { body?: string } }>; statuses?: Array<{ id?: string; status?: string; timestamp?: string }> } }> }>;
    };
    if (!Array.isArray(body.entry)) {
      return NextResponse.json({ error: 'Not a Meta webhook payload' }, { status: 400 });
    }

    // Normalize entry[].changes[].value into the internal results/statuses
    // contract the BullMQ worker consumes (aggregating ALL entries/changes).
    type NormalizedResult = { from?: string; messageId?: string; message?: { text?: string } };
    type NormalizedStatus = { messageId?: string; status?: string; timestamp?: string };
    const results: NormalizedResult[] = [];
    const statuses: NormalizedStatus[] = [];

    for (const entry of body.entry) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value?.messages ?? []) {
          results.push({ from: message.from, messageId: message.id, message: { text: message.text?.body } });
        }
        for (const status of change.value?.statuses ?? []) {
          statuses.push({ messageId: status.id, status: status.status, timestamp: status.timestamp });
        }
      }
    }

    const queue = getWabaWebhookQueue();
    if (!queue) {
      logger.error('waba_webhook.queue_unavailable', { requestId });
      return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    }

    const providerEventId = results[0]?.messageId || statuses[0]?.messageId;
    await queue.add('process-webhook', { ...body, results, statuses }, {
      jobId: providerEventId ? `waba-webhook-${providerEventId}` : undefined,
      removeOnComplete: true,
      removeOnFail: false,
    });

    logger.info('waba_webhook.accepted', {
      requestId,
      provider: 'meta',
      eventType: statuses.length > 0 ? 'status' : results.length > 0 ? 'message' : 'unknown',
      providerEventId: providerEventId || null,
      senderPhoneHash: hashPhone(results[0]?.from),
      resultCount: results.length,
      statusCount: statuses.length,
      queueInserted: true,
    });

    // Optional auto-reply (Meta Cloud API, free within the 24h session window).
    // Disabled by default; enable with META_WHATSAPP_AUTO_REPLY=true once
    // WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are configured. Fire-and-forget
    // so the 200 ACK to Meta is never delayed by the Graph API round-trip.
    if (process.env.META_WHATSAPP_AUTO_REPLY === 'true') {
      const replyText = (process.env.META_WHATSAPP_AUTO_REPLY_TEXT ||
        'Thanks for contacting TecBunny! Our team has received your message and will respond shortly.').slice(0, 1024);
      for (const result of results) {
        if (result.from && result.message?.text) {
          void sendWhatsAppTextMessage(result.from, replyText).catch((error: unknown) =>
            logger.error('waba_webhook.auto_reply_failed', { error: error instanceof Error ? error.message : String(error) }),
          );
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    logger.error('waba_webhook.error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
