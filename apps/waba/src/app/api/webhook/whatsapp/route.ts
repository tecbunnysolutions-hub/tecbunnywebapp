import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { getWabaWebhookQueue } from '@tecbunny/core/queue';
import { logger } from '@tecbunny/core/logger';
import { sendWhatsAppTextMessage } from '@tecbunny/core/whatsapp-cloud-api';

/**
 * Persistent debug trail (Hobby plan hides Vercel runtime logs). Writes each
 * webhook stage to a `webhook_debug_log` Supabase table so delivery can be
 * traced without log access. Fails silently if the table/DB is unavailable.
 */
async function writeDebugTrail(stage: string, detail: Record<string, unknown>): Promise<void> {
  try {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('webhook_debug_log').insert({
      stage,
      detail,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Never let debug logging break webhook processing.
  }
}

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

function hashPhone(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return crypto.createHash('sha256').update(value.trim()).digest('hex').slice(0, 16);
}

/**
 * Run background work after the response is ACKed. Uses Next's after() in a
 * real request scope; falls back to a plain promise in environments without one
 * (e.g. vitest, where after() throws "called outside a request scope").
 */
function runAfterResponse(work: () => Promise<void>): void {
  try {
    after(work);
  } catch {
    void work().catch((error) =>
      logger.error('waba_webhook.background_failed', { error: error instanceof Error ? error.message : String(error) }),
    );
  }
}

function verifyAgainstAnySecret(payload: Buffer | string, signature: string, secrets: Array<string | undefined>): boolean {
  return secrets.some((secret) => verifySignature(payload, signature, secret));
}

/**
 * Meta webhook verification challenge (GET). Meta calls this endpoint with
 * hub.mode=subscribe, hub.verify_token and hub.challenge when the webhook is
 * configured in the Meta app dashboard.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  // WHATSAPP_VERIFY_TOKEN is accepted as an alias for the Meta dashboard token.
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
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');

    logger.info('waba_webhook.received', {
      requestId,
      provider: 'infobip',
      payloadSize: rawBodyBuffer.byteLength,
      signaturePresent: Boolean(signature),
    });

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const infobipSecret = process.env.INFOBIP_HMAC_SECRET;
    const metaAppSecret = process.env.META_APP_SECRET;
    const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || infobipSecret;

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
      // Fallback to HMAC Signature Verification if token is not in URL.
      // Accept either the Meta app secret (Meta webhooks) or the Infobip HMAC secret.
      if (!signature) {
        console.error('Missing signature header and no URL token provided.');
        return NextResponse.json({ error: 'Missing authentication' }, { status: 401 });
      }
      if (!verifyAgainstAnySecret(rawBodyBuffer, signature, [metaAppSecret, infobipSecret])) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
    const body = parsedBody;
    const isMetaPayload = Array.isArray((body as { entry?: unknown }).entry);

    // P6-2: Replay attack prevention — reject payloads older than 5 minutes
    // Infobip includes a `timestamp` field in the webhook payload.
    if (!isMetaPayload) {
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
    }

    // Resolve the BullMQ queue (null when Redis is not configured / unreachable).
    // When null, Meta payloads are processed inline via after() below (Option B).
    const queue = getWabaWebhookQueue();

    type NormalizedResult = { from?: string; messageId?: string; message?: { text?: string }; mediaType?: string; mediaId?: string; mediaCaption?: string };
    type NormalizedStatus = { messageId?: string; status?: string; timestamp?: string };
    let results: NormalizedResult[] = [];
    let statuses: NormalizedStatus[] = [];
    let queuePayload: Record<string, unknown> = body;

    if (isMetaPayload) {
      // Meta Cloud API shape: { entry: [{ changes: [{ value: { messages, statuses } }] }] }
      // Normalized into the internal results/statuses contract the worker consumes.
      // Inbound media (image/document/audio/video/sticker) carries an opaque media
      // id + optional caption instead of text.body — surface it so the worker can
      // store a placeholder instead of dropping the message silently.
      const metaBody = body as {
        entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ id?: string; from?: string; type?: string; text?: { body?: string }; interactive?: { type?: string; button_reply?: { id?: string; title?: string }; list_reply?: { id?: string; title?: string; description?: string } } } & Record<string, { id?: string; caption?: string } | undefined>>; statuses?: Array<{ id?: string; status?: string; timestamp?: string }> } }> }>;
      };
      const MEDIA_TYPES = ['image', 'document', 'audio', 'video', 'sticker'] as const;
      for (const entry of metaBody.entry ?? []) {
        for (const change of entry.changes ?? []) {
          for (const message of change.value?.messages ?? []) {
            const mediaType = MEDIA_TYPES.find((type) => message[type]?.id);
            const media = mediaType ? message[mediaType] : undefined;
            // Interactive replies carry the tapped button/list row, not text.
            const interactiveReply = message.interactive?.button_reply?.title
              ?? message.interactive?.list_reply?.title;
            results.push({
              from: message.from,
              messageId: message.id,
              message: { text: message.text?.body ?? interactiveReply ?? (mediaType ? `[${mediaType}${media?.caption ? `: ${media.caption}` : ''}]` : undefined) },
              ...(mediaType ? { mediaType, mediaId: media?.id, mediaCaption: media?.caption } : {}),
            });
          }
          for (const status of change.value?.statuses ?? []) {
            statuses.push({ messageId: status.id, status: status.status, timestamp: status.timestamp });
          }
        }
      }
      queuePayload = { ...body, results, statuses };

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
    } else {
      const webhookRecord = body as { results?: Array<{ from?: string; messageId?: string; id?: string }>; statuses?: Array<{ messageId?: string; id?: string }> };
      results = Array.isArray(webhookRecord.results) ? webhookRecord.results : [];
      statuses = Array.isArray(webhookRecord.statuses) ? webhookRecord.statuses : [];
    }

    const providerEventId = results[0]?.messageId
      || statuses[0]?.messageId
      || (results[0] as { id?: string } | undefined)?.id
      || (statuses[0] as { id?: string } | undefined)?.id;

    // OPTION B: process Meta payloads inline via after() so Vercel serverless
    // delivers to the inbox WITHOUT needing the long-lived BullMQ worker. The
    // worker (worker.ts / Docker waba-worker) only runs on a persistent host;
    // on Vercel it never consumes the queue, so enqueue-only leaves the inbox
    // empty. We therefore ALWAYS run inline for Meta payloads, and ADDITIONALLY
    // enqueue when a queue exists (dedup by jobId prevents double-processing if
    // a worker is later deployed). after() ACKs Meta within the ~10s window while
    // triage (which calls Gemini AI) runs in the background. Meta does not retry
    // a 200, so inline failures are logged only.
    if (isMetaPayload) {
      runAfterResponse(async () => {
        await writeDebugTrail('inline_started', { requestId, providerEventId: providerEventId || null, results: results.length });
        try {
          const { InboundTriageAgent } = await import('@/agents/InboundTriageAgent');
          const { AssignmentOrchestrator } = await import('@/agents/AssignmentOrchestrator');
          const { RuleEngineService } = await import('@/services/RuleEngineService');

          const triageAgent = new InboundTriageAgent();
          const orchestrator = new AssignmentOrchestrator();

          const triageResult = await triageAgent.execute(queuePayload as never);
          await writeDebugTrail('triage_done', { requestId, hasResult: Boolean(triageResult) });
          let ruleEngineHandled = false;
          if (triageResult) {
            ruleEngineHandled = await RuleEngineService.evaluateRules(triageResult);
          }
          if (triageResult && !ruleEngineHandled) {
            await orchestrator.execute(triageResult);
          }
          await writeDebugTrail('inline_processed', { requestId, providerEventId: providerEventId || null });
          logger.info('waba_webhook.inline_processed', { requestId, providerEventId: providerEventId || null });
        } catch (inlineError) {
          await writeDebugTrail('inline_failed', {
            requestId,
            error: inlineError instanceof Error ? inlineError.message : String(inlineError),
          });
          logger.error('waba_webhook.inline_failed', {
            requestId,
            error: inlineError instanceof Error ? inlineError.message : String(inlineError),
          });
        }
      });
      logger.info('waba_webhook.inline_scheduled', { requestId, providerEventId: providerEventId || null });
    }

    if (queue) {
      await queue.add('process-webhook', queuePayload, {
        jobId: providerEventId ? `waba-webhook-${providerEventId}` : undefined,
        removeOnComplete: true,
        removeOnFail: false,
      });
      logger.info('waba_webhook.queued', { requestId, providerEventId: providerEventId || null });
    } else if (!isMetaPayload) {
      // Infobip payloads have no inline path — they require the worker. Surface it.
      console.error('Webhook queue not available and inline processing only supports Meta payloads');
      return NextResponse.json({ error: 'Queue unavailable' }, { status: 503 });
    }

    logger.info('waba_webhook.accepted', {
      requestId,
      provider: isMetaPayload ? 'meta' : 'infobip',
      eventType: statuses.length > 0 ? 'status' : results.length > 0 ? 'message' : 'unknown',
      providerEventId: providerEventId || null,
      senderPhoneHash: hashPhone(results[0]?.from),
      resultCount: results.length,
      statusCount: statuses.length,
      queueInserted: true,
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

