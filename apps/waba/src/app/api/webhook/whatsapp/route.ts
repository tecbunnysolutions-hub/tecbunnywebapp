import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getWabaWebhookQueue } from '@tecbunny/core/server';

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
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.INFOBIP_HMAC_SECRET;
  if (!secret) {
    throw new Error('INFOBIP_HMAC_SECRET environment variable is required but not set.');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Strip optional "sha256=" prefix sent by some providers
  const clean = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(clean, 'hex');
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // Bug #2 fix: Removed URL token authentication entirely. Tokens in query
    // parameters appear in server logs, CDN logs, and browser history, leaking
    // the secret. HMAC signature verification is the only accepted auth method.
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');

    if (!signature || !verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid or missing HMAC signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Enqueue payload to BullMQ
    const queue = getWabaWebhookQueue();
    if (!queue) {
      console.error('Webhook queue not available');
      return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    }

    await queue.add('process-webhook', body, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

