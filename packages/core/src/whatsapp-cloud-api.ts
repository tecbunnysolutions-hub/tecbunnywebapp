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

export interface WhatsAppSendResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppTextMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { sent: false, error: 'WhatsApp Cloud API is not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).' };
  }

  const toDigits = String(to ?? '').replace(/\D/g, '');
  const text = String(body ?? '').trim().slice(0, 4096);
  if (!toDigits || !text) {
    return { sent: false, error: 'Recipient and message body are required.' };
  }

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
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toDigits,
          type: 'text',
          text: { preview_url: true, body: text },
        }),
        signal: controller.signal,
      },
    );

    const result = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number };
    };

    if (!response.ok || result.error) {
      logger.error('whatsapp_cloud_api.send_failed', {
        status: response.status,
        metaError: result.error?.message ?? null,
      });
      return { sent: false, error: result.error?.message ?? `Graph API responded ${response.status}` };
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
