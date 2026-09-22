import { logger } from '@tecbunny/core/logger';

/**
 * Module 4 — WhatsApp Cloud API sender (free Meta-native tier, no BSP).
 *
 * Sends session/text messages through the Meta Graph API endpoint:
 *   POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
 *
 * Env (paste in apps/waba/.env.local and your hosting dashboard):
 *   WHATSAPP_TOKEN=EAAG...             # Meta App -> WhatsApp -> API setup -> access token
 *                                      # (META_WHATSAPP_ACCESS_TOKEN is accepted as a legacy alias)
 *   WHATSAPP_PHONE_NUMBER_ID=12345678  # WhatsApp -> API setup -> "Phone number ID" (NOT the phone number)
 *
 * Note: free-form text messages only work inside the 24h customer service
 * window opened by the user's inbound message. Outside that window you must
 * use a pre-approved template (type: 'template') — that is still free of BSP
 * fees, you only pay Meta's per-conversation rate.
 */

const GRAPH_API_VERSION = 'v20.0';
const SEND_TIMEOUT_MS = 8000;

/** Meta pair rate limit: 1 message / 6s per business<->user pair (error 131056). */
const PAIR_RATE_LIMIT_ERROR_CODE = 131056;
const MAX_RATE_LIMIT_RETRIES = 3;

export interface WhatsAppSendResult {
  sent: boolean;
  messageId?: string;
  error?: string;
  /** True when the failure was the per-user pair rate limit (retryable later). */
  rateLimited?: boolean;
}

interface GraphErrorBody {
  messages?: Array<{ id?: string }>;
  error?: { message?: string; code?: number };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST a message payload to the Cloud API with Meta's prescribed pair-rate-limit
 * handling: on error 131056 retry after 4^X seconds (X starting at 0), per
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform
 */
async function postMessageWithBackoff(
  phoneNumberId: string,
  token: string,
  payload: Record<string, unknown>,
): Promise<WhatsAppSendResult> {
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      const result = (await response.json().catch(() => ({}))) as GraphErrorBody;
      const errorCode = result.error?.code;

      if (errorCode === PAIR_RATE_LIMIT_ERROR_CODE && attempt < MAX_RATE_LIMIT_RETRIES) {
        const backoffMs = Math.pow(4, attempt) * 1000;
        logger.warn('whatsapp_cloud_api.rate_limited', { attempt, backoffMs });
        await sleep(backoffMs);
        continue;
      }

      if (!response.ok || result.error) {
        logger.error('whatsapp_cloud_api.send_failed', {
          status: response.status,
          metaError: result.error?.message ?? null,
          code: errorCode ?? null,
        });
        return {
          sent: false,
          error: result.error?.message ?? `Graph API responded ${response.status}`,
          rateLimited: errorCode === PAIR_RATE_LIMIT_ERROR_CODE,
        };
      }

      const messageId = result.messages?.[0]?.id;
      logger.info('whatsapp_cloud_api.sent', { messageId: messageId ?? null });
      return { sent: true, messageId };
    } catch (error) {
      logger.error('whatsapp_cloud_api.send_exception', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { sent: false, error: error instanceof Error ? error.message : 'Unknown send failure' };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { sent: false, error: 'Rate limit retries exhausted.', rateLimited: true };
}

function resolveCredentials(): { token: string; phoneNumberId: string } | { error: string } {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { error: 'WhatsApp Cloud API is not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).' };
  }
  return { token, phoneNumberId };
}

export async function sendWhatsAppTextMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  const credentials = resolveCredentials();
  if ('error' in credentials) return { sent: false, error: credentials.error };

  const toDigits = String(to ?? '').replace(/\D/g, '');
  const text = String(body ?? '').trim().slice(0, 4096);
  if (!toDigits || !text) {
    return { sent: false, error: 'Recipient and message body are required.' };
  }

  return postMessageWithBackoff(credentials.phoneNumberId, credentials.token, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toDigits,
    type: 'text',
    text: { preview_url: true, body: text },
  });
}

export interface WhatsAppTemplateComponent {
  type: 'body' | 'header' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: number;
  parameters: Array<Record<string, unknown>>;
}

/**
 * Send a pre-approved template message — the only message type allowed OUTSIDE
 * the 24h customer service window. Meta requires opt-in for template sends.
 */
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode = 'en',
  components?: WhatsAppTemplateComponent[],
): Promise<WhatsAppSendResult> {
  const credentials = resolveCredentials();
  if ('error' in credentials) return { sent: false, error: credentials.error };

  const toDigits = String(to ?? '').replace(/\D/g, '');
  const name = String(templateName ?? '').trim().toLowerCase();
  if (!toDigits || !name) {
    return { sent: false, error: 'Recipient and template name are required.' };
  }

  return postMessageWithBackoff(credentials.phoneNumberId, credentials.token, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toDigits,
    type: 'template',
    template: {
      name,
      language: { code: languageCode },
      ...(components && components.length > 0 ? { components } : {}),
    },
  });
}
