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
 * Bug #19 fix: Infobip sends the signature as a hex string (optionally prefixed
 * with "sha256="). The previous code digested as base64 and compared directly,
 * which always failed against a hex signature. Now we digest as hex and strip
 * the "sha256=" prefix before comparing.
 */
function verifySignature(payload: Buffer | string, signature: string, secret: string | undefined): boolean {
  if (!secret) {
    console.error('WhatsApp webhook signing secret is required but not set.');
    return false;
  }

  const clean = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  const expectedHex = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBase64 = crypto.createHmac('sha256', secret).update(payload).digest('base64');
  const expectedBase64Url = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  const validSignatures = [expectedHex, expectedBase64, expectedBase64Url];
  
  let isValid = false;
  for (const validSig of validSignatures) {
    try {
      const expectedBuf = Buffer.from(validSig, 'utf8');
      const actualBuf = Buffer.from(clean, 'utf8');
      if (expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        isValid = true;
        break;
      }
    } catch {
      // ignore
    }
  }

  if (!isValid) {
    console.error('Signature mismatch for WABA webhook payload.');
  }

  return isValid;
}

export async function POST(req: Request) {
  try {
    const rawBodyBuffer = Buffer.from(await req.arrayBuffer());
    const rawBody = rawBodyBuffer.toString('utf8');

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const webhookSecret = process.env.INFOBIP_HMAC_SECRET;
    const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || webhookSecret;

    // Bug #2 fix / Revert: Infobip uses the URL token for this integration.
    // If the token is present in the URL, prioritize validating it.
    if (token) {
      const envSecret = webhookVerifyToken?.replace(/["']/g, "");
      if (!envSecret) {
        console.error('WhatsApp webhook secret is missing in Vercel environment variables!');
        return NextResponse.json({ error: 'Server configuration error: webhook secret is missing.' }, { status: 500 });
      }
      const tokenBuf = Buffer.from(token, 'utf8');
      const secretBuf = Buffer.from(envSecret, 'utf8');
      const isTokenValid =
        tokenBuf.length === secretBuf.length &&
        crypto.timingSafeEqual(tokenBuf, secretBuf);
      if (!isTokenValid) {
        console.error('Invalid URL token: timing-safe comparison failed.');
        return NextResponse.json({ error: 'Invalid URL token mismatch.' }, { status: 401 });
      }
    } else {
      // Fallback to HMAC Signature Verification if token is not in URL
      const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');
      if (!signature) {
        console.error('Missing signature header and no URL token provided.');
        return NextResponse.json({ error: 'Missing authentication' }, { status: 401 });
      }
      if (!verifySignature(rawBodyBuffer, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    const body = parsedBody;

    // P6-2: Replay attack prevention — reject payloads older than 5 minutes
    // Infobip includes a `timestamp` field in the webhook payload.
    const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    const replayPayload = body as { timestamp?: unknown; results?: Array<{ receivedAt?: unknown }> };
    const payloadTs = (replayPayload.timestamp || replayPayload.results?.[0]?.receivedAt) as string | number | undefined;
    if (payloadTs) {
      const ts = new Date(payloadTs).getTime();
      if (!isNaN(ts) && Date.now() - ts > REPLAY_WINDOW_MS) {
        console.warn('[webhook] Rejected stale payload (replay protection). Age:', Date.now() - ts, 'ms');
        return NextResponse.json({ error: 'Payload timestamp too old' }, { status: 400 });
      }
    }

    // Enqueue payload to BullMQ
    const queue = getWabaWebhookQueue();
    if (!queue) {
      console.error('Webhook queue not available');
      return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    }

    const webhookRecord = body as { results?: Array<{ messageId?: string; id?: string }>; statuses?: Array<{ messageId?: string; id?: string }> };
    const providerEventId = webhookRecord.results?.[0]?.messageId
      || webhookRecord.statuses?.[0]?.messageId
      || webhookRecord.results?.[0]?.id
      || webhookRecord.statuses?.[0]?.id;
    await queue.add('process-webhook', body, {
      jobId: providerEventId ? `waba-webhook-${providerEventId}` : undefined,
      removeOnComplete: true,
      removeOnFail: false,
    });

    logger.info('waba_webhook.accepted', {
      providerEventId: providerEventId || null,
      resultCount: Array.isArray(webhookRecord.results) ? webhookRecord.results.length : 0,
      statusCount: Array.isArray(webhookRecord.statuses) ? webhookRecord.statuses.length : 0,
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

