import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getWabaWebhookQueue } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core/logger';
import { sendWhatsAppTextMessage } from '@tecbunny/core/whatsapp-cloud-api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type IncomingMessage = { id?: string; from?: string; type?: string; text?: { body?: string }; interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } }; [key: string]: unknown };
type WebhookBody = { entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[]; statuses?: Array<{ id?: string; status?: string; timestamp?: string }> } }> }> };

function validSignature(payload: Buffer, signature: string, secret?: string) {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const supplied = signature.replace(/^sha256=/, '');
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied)); } catch { return false; }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;
  if (params.get('hub.mode') === 'subscribe' && token && params.get('hub.verify_token') === token && params.get('hub.challenge')) {
    return new Response(params.get('hub.challenge')!, { headers: { 'Content-Type': 'text/plain' } });
  }
  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const raw = Buffer.from(await request.arrayBuffer());
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) return NextResponse.json({ error: 'Missing X-Hub-Signature-256 header' }, { status: 401 });
    if (!validSignature(raw, signature, process.env.META_APP_SECRET)) return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    const body = JSON.parse(raw.toString('utf8')) as WebhookBody;
    if (!Array.isArray(body.entry)) return NextResponse.json({ error: 'Not a Meta webhook payload' }, { status: 400 });
    const results: Array<{ from?: string; messageId?: string; message: { text?: string } }> = [];
    const statuses: Array<{ messageId?: string; status?: string; timestamp?: string }> = [];
    for (const entry of body.entry) for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        const interactive = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title;
        results.push({ from: message.from, messageId: message.id, message: { text: message.text?.body || interactive } });
      }
      for (const status of change.value?.statuses || []) statuses.push({ messageId: status.id, status: status.status, timestamp: status.timestamp });
    }
    const queue = getWabaWebhookQueue();
    if (!queue) return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    const eventId = results[0]?.messageId || statuses[0]?.messageId;
    await queue.add('process-webhook', { ...body, results, statuses }, { jobId: eventId ? `waba-webhook-${eventId}` : undefined, removeOnComplete: true, removeOnFail: false });
    if (process.env.META_WHATSAPP_AUTO_REPLY === 'true') {
      const reply = (process.env.META_WHATSAPP_AUTO_REPLY_TEXT || 'Thanks for contacting TecBunny! Our team has received your message and will respond shortly.').slice(0, 1024);
      for (const item of results) if (item.from && item.message.text) void sendWhatsAppTextMessage(item.from, reply).catch((error: unknown) => logger.error('waba_webhook.auto_reply_failed', { error: error instanceof Error ? error.message : String(error) }));
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    logger.error('waba_webhook.error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
