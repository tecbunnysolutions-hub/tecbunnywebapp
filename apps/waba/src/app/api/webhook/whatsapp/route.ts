import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getWabaWebhookQueue } from '@tecbunny/core/server';

const INFOBIP_HMAC_SECRET = process.env.INFOBIP_HMAC_SECRET || 'bunny@6010';

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !INFOBIP_HMAC_SECRET) return false;
  
  const hash = crypto
    .createHmac('sha256', INFOBIP_HMAC_SECRET)
    .update(payload)
    .digest('base64');
    
  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Check if the user is passing a token in the URL query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    // Check headers for HMAC signature
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');

    // Authenticate via URL token OR HMAC signature
    let isAuthenticated = false;
    
    if (token === INFOBIP_HMAC_SECRET) {
      isAuthenticated = true;
    } else if (signature && verifySignature(rawBody, signature)) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Invalid authentication token or signature' }, { status: 401 });
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
      removeOnFail: false
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

