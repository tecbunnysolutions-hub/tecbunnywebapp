import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getWabaWebhookQueue } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core/logger';

// Bug #1 fix: Remove hardcoded secret fallback. Throw at startup if missing.
// Moving the check to runtime to prevent Vercel build failures when secret is not set.

/**
 * Bug #3 fix: Use timing-safe comparison (crypto.timingSafeEqual) to prevent
 * timing oracle attacks that could reconstruct the HMAC secret byte-by-byte.
 *
 * Meta sends the signature as a hex string prefixed with "sha256=".
 */
function verifySignature(payload: Buffer | string, signature: string, secret: string | undefined): boolean {
  if (!secret) {
    console.error('WhatsApp webhook signing secret is required but not set.');
    return false;
  }

  const clean = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(clean, 'utf8');
  const isValid = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

  if (!isValid) {
    console.error('Signature mismatch for WABA webhook payload.');
  }

  return isValid;
}

function hashPhone(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return crypto.createHash('sha256').update(value.trim()).digest('hex').slice(0, 16);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN;

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
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');

    logger.info('waba_webhook.received', {
      requestId,
      provider: 'meta',
      payloadSize: rawBodyBuffer.byteLength,
      signaturePresent: Boolean(signature),
    });

    const appSecret = process.env.META_APP_SECRET;
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    if (!verifySignature(rawBodyBuffer, signature, appSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    const body = parsedBody;

    // Enqueue payload to BullMQ
    const queue = getWabaWebhookQueue();
    if (!queue) {
      console.error('Webhook queue not available');
      return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    }

    const webhookRecord = body as {
      entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ id?: string; from?: string }>; statuses?: Array<{ id?: string }> } }> }>;
    };
    const value = webhookRecord.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages ?? [];
    const statuses = value?.statuses ?? [];
    const normalizedBody = {
      ...body,
      results: messages.map((message) => ({
        from: message.from,
        messageId: message.id,
        message: { text: (message as { text?: { body?: string } }).text?.body },
      })),
      statuses: statuses.map((status) => ({
        messageId: status.id,
        status: (status as { status?: string }).status,
        timestamp: (status as { timestamp?: string }).timestamp,
      })),
    };
    const providerEventId = messages[0]?.id || statuses[0]?.id;
    await queue.add('process-webhook', normalizedBody, {
      jobId: providerEventId ? `waba-webhook-${providerEventId}` : undefined,
      removeOnComplete: true,
      removeOnFail: false,
    });

    logger.info('waba_webhook.accepted', {
      requestId,
      provider: 'meta',
      eventType: statuses.length > 0 ? 'status' : messages.length > 0 ? 'message' : 'unknown',
      providerEventId: providerEventId || null,
      senderPhoneHash: hashPhone(messages[0]?.from),
      resultCount: messages.length,
      statusCount: statuses.length,
      queueInserted: true,
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

