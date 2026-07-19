// Bug #1 fix: Remove all hardcoded credential fallbacks. Missing required env
// vars throw at module load time so the problem is caught immediately on startup.
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Bug #1 fix: Remove all hardcoded credential fallbacks. Missing required env
// vars throw at runtime so the problem is caught immediately on use, without
// breaking Next.js static build pre-evaluation.

const getInfobipConfig = () => {
  const baseUrl = process.env.INFOBIP_BASE_URL;
  const apiKey = process.env.INFOBIP_API_KEY;
  const systemNumber = process.env.INFOBIP_WHATSAPP_FROM;

  if (!baseUrl) throw new Error('INFOBIP_BASE_URL is required');
  if (!apiKey) throw new Error('INFOBIP_API_KEY is required');
  if (!systemNumber) throw new Error('INFOBIP_WHATSAPP_FROM is required');

  return {
    baseUrl,
    apiKey,
    systemNumber,
    templateName: process.env.INFOBIP_WHATSAPP_TEMPLATE_NAME ?? 'hello_world',
    templateLanguage: process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE ?? 'en'
  };
};

// Bug #13 fix: Always returns a value. The previous implementation could fall
// off the end of the while loop after exhausting 5xx retries without returning,
// yielding undefined and silently swallowing errors.
// Bug #25 fix: Removed all `require('crypto')` calls — crypto is now imported
// at the top of the file as an ES module import.
async function logFailedCall(payload: unknown, errorMsg: string) {
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

async function sendInfobipRequest(
  endpoint: string,
  payload: unknown,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { baseUrl: rawBaseUrl, apiKey } = getInfobipConfig();
  const baseUrl = rawBaseUrl.replace(/^https?:\/\//, '');
  const url = `https://${baseUrl}${endpoint}`;

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `App ${apiKey}`,
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

async function getInfobipRequest(
  endpoint: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { baseUrl: rawBaseUrl, apiKey } = getInfobipConfig();
  const baseUrl = rawBaseUrl.replace(/^https?:\/\//, '');
  const url = `https://${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `App ${apiKey}`,
        Accept: 'application/json',
      },
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { success: true, data };
    return { success: false, error: data, status: response.status };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

type ProviderTemplate = {
  id?: string;
  name?: string;
  templateName?: string;
  language?: string;
  languageCode?: string;
  status?: string;
  category?: string;
  body?: string;
  content?: string | { text?: string; body?: { text?: string } };
  rejectionReason?: string;
  reason?: string;
};

function getProviderTemplates(data: unknown): ProviderTemplate[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const candidate = record.templates ?? record.results ?? record.items ?? record.templateList ?? record.data;
  return Array.isArray(candidate) ? candidate.filter((item): item is ProviderTemplate => typeof item === 'object' && item !== null) : [];
}

function getProviderTemplateContent(template: ProviderTemplate) {
  if (typeof template.content === 'string') return template.content;
  if (template.content?.text) return template.content.text;
  if (template.content?.body?.text) return template.content.body.text;
  return template.body ?? '';
}

function countTemplateVariables(content: string) {
  const matches = content.match(/\{\{\d+\}\}/g) ?? [];
  return new Set(matches).size;
}

export async function syncInfobipTemplates(): Promise<{
  success: boolean;
  synced: number;
  error?: unknown;
  status?: number;
}> {
  const { systemNumber } = getInfobipConfig();
  const endpoint = process.env.INFOBIP_WHATSAPP_TEMPLATE_SYNC_PATH ?? `/whatsapp/2/senders/${encodeURIComponent(systemNumber)}/templates`;
  const response = await getInfobipRequest(endpoint);
  if (!response.success) {
    return { success: false, synced: 0, error: response.error, status: response.status };
  }

  const templates = getProviderTemplates(response.data);
  const now = new Date().toISOString();
  let synced = 0;

  for (const template of templates) {
    const name = template.name ?? template.templateName;
    if (!name) continue;

    const content = getProviderTemplateContent(template);
    const providerStatus = (template.status ?? 'UNKNOWN').toUpperCase();
    const { error } = await supabase
      .from('Template')
      .upsert({
        id: crypto.randomUUID(),
        name,
        language: template.language ?? template.languageCode ?? 'en',
        content,
        status: providerStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
        category: template.category ?? 'MARKETING',
        provider_name: 'infobip',
        provider_template_id: template.id ?? name,
        provider_status: providerStatus,
        variable_count: countTemplateVariables(content),
        last_synced_at: now,
        rejection_reason: template.rejectionReason ?? template.reason ?? null,
      }, { onConflict: 'name' });

    if (!error) synced++;
  }

  return { success: true, synced };
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
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  placeholders: string[] = [],
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { systemNumber, templateLanguage } = getInfobipConfig();
  const payload = {
    messages: [
      {
        from: systemNumber,
        to,
        content: {
          templateName,
          templateData: { body: { placeholders } },
          language: templateLanguage,
        },
      },
    ],
  };

  const response = await sendInfobipRequest('/whatsapp/1/message/template', payload);
  return response ?? { success: false, error: 'No response from Infobip' };
}

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
    const { templateName } = getInfobipConfig();
    return sendTemplateMessage(to, templateName);
  }

  const { systemNumber } = getInfobipConfig();
  const payload = {
    from: systemNumber,
    to,
    content: { text },
  };

  const response = await sendInfobipRequest('/whatsapp/1/message/text', payload);
  return response ?? { success: false, error: 'No response from Infobip' };
}

export async function sendWhatsAppMedia(
  to: string,
  type: 'image' | 'video' | 'audio' | 'document',
  mediaUrl: string,
  caption?: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { systemNumber } = getInfobipConfig();
  const payload: Record<string, unknown> = {
    from: systemNumber,
    to,
    content: { mediaUrl },
  };

  if (caption) {
    (payload.content as Record<string, unknown>).caption = caption;
  }

  const response = await sendInfobipRequest(`/whatsapp/1/message/${type}`, payload);

  if (response?.success) {
    const msgId = (response.data as { messages?: Array<{ messageId?: string }> })?.messages?.[0]?.messageId;
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
  const { systemNumber } = getInfobipConfig();
  const payload: Record<string, unknown> = {
    from: systemNumber,
    to,
    content: { latitude, longitude },
  };

  if (name) (payload.content as Record<string, unknown>).name = name;
  if (address) (payload.content as Record<string, unknown>).address = address;

  const response = await sendInfobipRequest('/whatsapp/1/message/location', payload);

  if (response?.success) {
    const msgId = (response.data as { messages?: Array<{ messageId?: string }> })?.messages?.[0]?.messageId;
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
