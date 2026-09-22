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

// ---------------------------------------------------------------------------
// Interactive messages (reply buttons / option lists) — Tier 2 Cloud API types.
// Only valid INSIDE the 24h customer service window, same as free-form text.
// ---------------------------------------------------------------------------

export interface WhatsAppInteractiveHeader {
  type: 'text';
  text: string;
}

export interface WhatsAppReplyButton {
  /** Unique ID returned in the webhook when the user taps this button. */
  id: string;
  /** Button label, max 20 characters. */
  title: string;
}

/**
 * Send up to 3 quick-reply buttons. The webhook delivers the tapped button as
 * message.type='interactive' with interactive.button_reply.{id,title}.
 */
export async function sendWhatsAppInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: WhatsAppReplyButton[],
  headerText?: string,
  footerText?: string,
): Promise<WhatsAppSendResult> {
  const credentials = resolveCredentials();
  if ('error' in credentials) return { sent: false, error: credentials.error };

  const toDigits = String(to ?? '').replace(/\D/g, '');
  const body = String(bodyText ?? '').trim().slice(0, 1024);
  const normalizedButtons = buttons
    .slice(0, 3) // Meta hard limit
    .map((button) => ({
      type: 'reply' as const,
      reply: {
        id: String(button.id ?? '').slice(0, 256),
        title: String(button.title ?? '').slice(0, 20),
      },
    }))
    .filter((button) => button.reply.id && button.reply.title);

  if (!toDigits || !body || normalizedButtons.length === 0) {
    return { sent: false, error: 'Recipient, body text and at least one button are required.' };
  }

  return postMessageWithBackoff(credentials.phoneNumberId, credentials.token, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toDigits,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: { buttons: normalizedButtons },
      ...(headerText ? { header: { type: 'text', text: headerText.slice(0, 60) } satisfies WhatsAppInteractiveHeader } : {}),
      ...(footerText ? { footer: { text: footerText.slice(0, 60) } } : {}),
    },
  });
}

export interface WhatsAppListRow {
  /** Unique ID returned in the webhook when the user picks this row. */
  id: string;
  /** Row label, max 24 characters. */
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title?: string;
  rows: WhatsAppListRow[];
}

/**
 * Send an option list (max 10 rows total across sections). The webhook delivers
 * the selection as message.type='interactive' with interactive.list_reply.{id,title}.
 */
export async function sendWhatsAppInteractiveList(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: WhatsAppListSection[],
  headerText?: string,
  footerText?: string,
): Promise<WhatsAppSendResult> {
  const credentials = resolveCredentials();
  if ('error' in credentials) return { sent: false, error: credentials.error };

  const toDigits = String(to ?? '').replace(/\D/g, '');
  const body = String(bodyText ?? '').trim().slice(0, 1024);
  const normalizedSections = sections
    .map((section) => ({
      ...(section.title ? { title: section.title.slice(0, 24) } : {}),
      rows: section.rows
        .map((row) => ({
          id: String(row.id ?? '').slice(0, 200),
          title: String(row.title ?? '').slice(0, 24),
          ...(row.description ? { description: row.description.slice(0, 72) } : {}),
        }))
        .filter((row) => row.id && row.title),
    }))
    .filter((section) => section.rows.length > 0);

  const totalRows = normalizedSections.reduce((sum, section) => sum + section.rows.length, 0);
  if (!toDigits || !body || totalRows === 0) {
    return { sent: false, error: 'Recipient, body text and at least one list row are required.' };
  }
  if (totalRows > 10) {
    return { sent: false, error: 'WhatsApp lists support a maximum of 10 rows.' };
  }

  return postMessageWithBackoff(credentials.phoneNumberId, credentials.token, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toDigits,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body },
      action: { button: String(buttonLabel ?? 'View options').slice(0, 20), sections: normalizedSections },
      ...(headerText ? { header: { type: 'text', text: headerText.slice(0, 60) } satisfies WhatsAppInteractiveHeader } : {}),
      ...(footerText ? { footer: { text: footerText.slice(0, 60) } } : {}),
    },
  });
}

// ---------------------------------------------------------------------------
// Inbound media retrieval — webhook payloads carry an opaque media id; the
// binary must be fetched in two steps: id -> temporary URL -> download.
// ---------------------------------------------------------------------------

export interface WhatsAppMediaInfo {
  url: string;
  mimeType?: string;
  fileSize?: number;
  sha256?: string;
}

/**
 * Resolve a media id (from a webhook message's image/document/audio/video block)
 * to a temporary download URL. The URL expires ~5 minutes after issuance and
 * still requires the Authorization header to download.
 */
export async function getWhatsAppMediaUrl(mediaId: string): Promise<WhatsAppMediaInfo | { error: string }> {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    return { error: 'WhatsApp Cloud API is not configured (WHATSAPP_TOKEN).' };
  }

  const id = String(mediaId ?? '').trim();
  if (!id) return { error: 'mediaId is required.' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
    });
    const result = (await response.json().catch(() => ({}))) as {
      url?: string;
      mime_type?: string;
      file_size?: number;
      sha256?: string;
      error?: { message?: string };
    };

    if (!response.ok || !result.url) {
      logger.error('whatsapp_cloud_api.media_lookup_failed', { status: response.status, metaError: result.error?.message ?? null });
      return { error: result.error?.message ?? `Graph API responded ${response.status}` };
    }

    return { url: result.url, mimeType: result.mime_type, fileSize: result.file_size, sha256: result.sha256 };
  } catch (error) {
    logger.error('whatsapp_cloud_api.media_lookup_exception', { error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : 'Media lookup failed' };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Download the binary for a media id. Combine with Supabase Storage upload
 * (same pattern as apps/waba /api/messages/media) to persist inbound files.
 */
export async function downloadWhatsAppMedia(mediaId: string): Promise<{ data: Buffer; mimeType?: string } | { error: string }> {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    return { error: 'WhatsApp Cloud API is not configured (WHATSAPP_TOKEN).' };
  }

  const info = await getWhatsAppMediaUrl(mediaId);
  if ('error' in info) return info;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS * 4); // media can be large
  try {
    const response = await fetch(info.url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!response.ok) {
      return { error: `Media download responded ${response.status}` };
    }
    const data = Buffer.from(await response.arrayBuffer());
    return { data, mimeType: info.mimeType };
  } catch (error) {
    logger.error('whatsapp_cloud_api.media_download_exception', { error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : 'Media download failed' };
  } finally {
    clearTimeout(timeout);
  }
}
