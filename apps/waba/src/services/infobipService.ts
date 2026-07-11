// Bug #1 fix: Remove all hardcoded credential fallbacks. Missing required env
// vars throw at module load time so the problem is caught immediately on startup.
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

if (!process.env.INFOBIP_BASE_URL) throw new Error('INFOBIP_BASE_URL is required');
if (!process.env.INFOBIP_API_KEY) throw new Error('INFOBIP_API_KEY is required');
if (!process.env.INFOBIP_WHATSAPP_FROM) throw new Error('INFOBIP_WHATSAPP_FROM is required');

const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const SYSTEM_NUMBER = process.env.INFOBIP_WHATSAPP_FROM;
const TEMPLATE_NAME = process.env.INFOBIP_WHATSAPP_TEMPLATE_NAME ?? 'hello_world';
const TEMPLATE_LANGUAGE = process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE ?? 'en';

// Bug #13 fix: Always returns a value. The previous implementation could fall
// off the end of the while loop after exhausting 5xx retries without returning,
// yielding undefined and silently swallowing errors.
// Bug #25 fix: Removed all `require('crypto')` calls — crypto is now imported
// at the top of the file as an ES module import.
async function sendInfobipRequest(
  endpoint: string,
  payload: unknown,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const baseUrl = INFOBIP_BASE_URL.replace(/^https?:\/\//, '');
  const url = `https://${baseUrl}${endpoint}`;

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `App ${INFOBIP_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return { success: true, data };
      }

      if (response.status >= 500 && response.status < 600) {
        attempt++;
        if (attempt >= maxRetries) {
          await logFailedCall(payload, `Status: ${response.status} - ${JSON.stringify(data)}`);
          return { success: false, error: data, status: response.status };
        }
        // Exponential backoff: 1s, 2s, 3s
        await new Promise(res => setTimeout(res, 1000 * attempt));
        continue;
      }

      // Client error (4xx) — non-retriable
      await logFailedCall(payload, `Status: ${response.status} - ${JSON.stringify(data)}`);
      return { success: false, error: data, status: response.status };

    } catch (error: unknown) {
      attempt++;
      const msg = error instanceof Error ? error.message : String(error);
      if (attempt >= maxRetries) {
        await logFailedCall(payload, msg);
        return { success: false, error: msg };
      }
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }

  // Exhausted retries — should not normally reach here
  return { success: false, error: 'Max retries exhausted' };
}

async function logFailedCall(payload: any, errorMsg: string) {
  try {
    await supabase.from('FailedApiCall').insert({
      payload: JSON.stringify(payload),
      error: errorMsg,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log API call', err);
  }
}

/**
 * Bug #10 fix: The 24h window check previously read last_interaction_timestamp
 * AFTER InboundTriageAgent had already updated it to now(), so the check always
 * saw a fresh timestamp and never fell back to a template message.
 *
 * Fix: Accept the pre-interaction timestamp as a parameter so the caller passes
 * the value it read BEFORE updating the conversation. This preserves the correct
 * 24h window semantics.
 *
 * Bug #9 fix: Removed the duplicate Message insert from this function. The
 * InboundTriageAgent is the single source of truth for CRM message logging.
 * Having both this function AND the agent insert the same outbound message
 * created two duplicate records per AI reply.
 *
 * Bug #25 fix: All `require('crypto')` calls replaced with the top-level import.
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string,
  lastInteractionTimestamp?: string | null,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const now = new Date();

  // Use the caller-supplied timestamp (captured before the conversation update)
  // so the 24h check is not defeated by the update that already happened.
  const isOutside24h =
    !lastInteractionTimestamp ||
    now.getTime() - new Date(lastInteractionTimestamp).getTime() > 24 * 60 * 60 * 1000;

  if (isOutside24h) {
    return sendTemplateMessage(to, TEMPLATE_NAME);
  }

  const payload = {
    from: SYSTEM_NUMBER,
    to,
    content: { text },
  };

  const response = await sendInfobipRequest('/whatsapp/1/message/text', payload);
  return response ?? { success: false, error: 'No response from Infobip' };
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  placeholders: string[] = [],
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const payload = {
    messages: [
      {
        from: SYSTEM_NUMBER,
        to,
        content: {
          templateName,
          templateData: { body: { placeholders } },
          language: TEMPLATE_LANGUAGE,
        },
      },
    ],
  };

  const response = await sendInfobipRequest('/whatsapp/1/message/template', payload);
  return response ?? { success: false, error: 'No response from Infobip' };
}

export async function sendWhatsAppMedia(
  to: string,
  type: 'image' | 'video' | 'audio' | 'document',
  mediaUrl: string,
  caption?: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const payload: Record<string, unknown> = {
    from: SYSTEM_NUMBER,
    to,
    content: { mediaUrl },
  };

  if (caption) {
    (payload.content as Record<string, unknown>).caption = caption;
  }

  const response = await sendInfobipRequest(`/whatsapp/1/message/${type}`, payload);

  if (response?.success) {
    const msgId = (response.data as any)?.messages?.[0]?.messageId;
    await supabase.from('Message').insert({
      id: crypto.randomUUID(),
      message_id: msgId,
      sender_number: to,
      direction: 'OUTBOUND',
      message_content: caption || '[Media]',
      media_url: mediaUrl,
      media_type: type.toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  }

  return response ?? { success: false, error: 'No response from Infobip' };
}

export async function sendWhatsAppLocation(
  to: string,
  latitude: number,
  longitude: number,
  name?: string,
  address?: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const payload: Record<string, unknown> = {
    from: SYSTEM_NUMBER,
    to,
    content: { latitude, longitude },
  };

  if (name) (payload.content as Record<string, unknown>).name = name;
  if (address) (payload.content as Record<string, unknown>).address = address;

  const response = await sendInfobipRequest('/whatsapp/1/message/location', payload);

  if (response?.success) {
    const msgId = (response.data as any)?.messages?.[0]?.messageId;
    await supabase.from('Message').insert({
      id: crypto.randomUUID(),
      message_id: msgId,
      sender_number: to,
      direction: 'OUTBOUND',
      message_content: `📍 Location: https://maps.google.com/?q=${latitude},${longitude}${address ? ` (${address})` : ''}`,
      timestamp: new Date().toISOString(),
    });
  }

  return response ?? { success: false, error: 'No response from Infobip' };
}
