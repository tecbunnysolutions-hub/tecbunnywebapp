// Bug #1 fix: Remove all hardcoded credential fallbacks. Missing required env
// vars throw at module load time so the problem is caught immediately on startup.
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { OutboundEventService } from '@tecbunny/core';
import type { OutboundEventRecord } from '@tecbunny/core';

type OutboundEventContext = {
  conversationId?: string;
  leadId?: string;
  campaignId?: string;
  userId?: string;
  idempotencyKey?: string;
  maxRetries?: number;
};

function existingEventResponse(event: OutboundEventRecord | null) {
  if (!event || event.status === 'PENDING' || event.status === 'RETRYING') return null;
  if (event.status === 'DELIVERED') {
    return {
      success: true,
      data: { messages: [{ messageId: event.provider_message_id }] },
    };
  }
  return { success: false, error: `Outbound event is already ${event.status}` };
}

// Bug #1 fix: Remove all hardcoded credential fallbacks. Missing required env
// vars throw at runtime so the problem is caught immediately on use, without
// breaking Next.js static build pre-evaluation.

const getMetaConfig = () => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!accessToken) throw new Error('META_ACCESS_TOKEN is required');
  if (!phoneNumberId) throw new Error('META_PHONE_NUMBER_ID is required');

  return {
    accessToken,
    phoneNumberId,
    apiVersion: process.env.META_GRAPH_API_VERSION ?? 'v25.0',
    templateName: process.env.META_WHATSAPP_TEMPLATE_NAME ?? 'hello_world',
    templateLanguage: process.env.META_WHATSAPP_TEMPLATE_LANGUAGE ?? 'en_US',
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

async function sendMetaRequest(
  payload: unknown,
  eventId: string,
  claimedProcessingToken?: string | null,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { accessToken, phoneNumberId, apiVersion } = getMetaConfig();
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const claimedToken = claimedProcessingToken ?? await OutboundEventService.markProcessing(supabase, eventId);

  const { data: event, error: eventError } = await supabase
    .from('waba_outbound_events')
    .select('status, requires_consent, campaign_id, phone_number, processing_token')
    .eq('id', eventId)
    .maybeSingle();
  if (eventError || !event || event.status !== 'PROCESSING' || !claimedToken || event.processing_token !== claimedToken) {
    throw new Error(`Outbound event is not deliverable: ${eventError?.message || event?.status || 'missing'}`);
  }
  if (event.requires_consent) {
    const { data: consent } = await supabase
      .from('waba_contact_consent')
      .select('opted_in, opted_out_at')
      .eq('phone', event.phone_number)
      .maybeSingle();
    if (!consent?.opted_in || consent.opted_out_at) {
      await OutboundEventService.markBlocked(supabase, eventId, 'CONSENT_REVOKED', 'Recipient consent is not active', event.processing_token);
      throw new Error('Outbound send blocked: recipient consent is not active');
    }
  }
  if (event.campaign_id) {
    const { data: campaign } = await supabase
      .from('mkt_campaigns')
      .select('status')
      .eq('id', event.campaign_id)
      .maybeSingle();
    if (!campaign || !['RUNNING', 'SCHEDULED'].includes(campaign.status)) {
      await OutboundEventService.markBlocked(supabase, eventId, 'CAMPAIGN_INACTIVE', 'Campaign is not active', event.processing_token);
      throw new Error('Outbound send blocked: campaign is not active');
    }
  }
  const processingToken = claimedToken || event.processing_token;

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const providerMessageId = (data as { messages?: Array<{ id?: string }> })?.messages?.[0]?.id || null;
        await OutboundEventService.markDelivered(supabase, eventId, providerMessageId || 'unknown', `${response.status}`, processingToken);
        return { success: true, data };
      }

      if (response.status >= 500 && response.status < 600) {
        attempt++;
        if (attempt >= maxRetries) {
          await OutboundEventService.markFailedAndScheduleRetry(supabase, eventId, String(response.status), JSON.stringify(data), processingToken);
          await logFailedCall(payload, `Status: ${response.status} - ${JSON.stringify(data)}`);
          return { success: false, error: data, status: response.status };
        }
        // Exponential backoff: 1s, 2s, 3s
        await new Promise(res => setTimeout(res, 1000 * attempt));
        continue;
      }

      // Client error (4xx) — non-retriable
      await OutboundEventService.markFailedAndScheduleRetry(supabase, eventId, String(response.status), JSON.stringify(data), processingToken);
      await logFailedCall(payload, `Status: ${response.status} - ${JSON.stringify(data)}`);
      return { success: false, error: data, status: response.status };

    } catch (error: unknown) {
      attempt++;
      const msg = error instanceof Error ? error.message : String(error);
      if (attempt >= maxRetries) {
        await OutboundEventService.markFailedAndScheduleRetry(supabase, eventId, 'NETWORK_ERROR', msg, processingToken);
        await logFailedCall(payload, msg);
        return { success: false, error: msg };
      }
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }

  // Exhausted retries — should not normally reach here
  return { success: false, error: 'Max retries exhausted' };
}

async function getMetaRequest(
  path: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { accessToken, apiVersion } = getMetaConfig();
  const url = `https://graph.facebook.com/${apiVersion}/${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
  template?: { name?: string; id?: string };
  language?: string;
  languageCode?: string;
  status?: string;
  approvalStatus?: string;
  approval_status?: string;
  category?: string;
  body?: string;
  content?: string | { text?: string; body?: { text?: string } };
  rejectionReason?: string;
  reason?: string;
};

function getProviderTemplates(data: unknown): ProviderTemplate[] {
  if (Array.isArray(data)) {
    return data.filter((item): item is ProviderTemplate => typeof item === 'object' && item !== null);
  }
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const candidate = record.templates ?? record.results ?? record.items ?? record.templateList ?? record.data;
  if (Array.isArray(candidate)) {
    return candidate.filter((item): item is ProviderTemplate => typeof item === 'object' && item !== null);
  }
  if (candidate && typeof candidate === 'object') return getProviderTemplates(candidate);
  return [];
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
  const wabaId = process.env.META_WABA_ID;
  if (!wabaId) throw new Error('META_WABA_ID is required');
  const response = await getMetaRequest(`${wabaId}/message_templates`);
  if (!response.success) {
    return { success: false, synced: 0, error: response.error, status: response.status };
  }

  const templates = getProviderTemplates(response.data);
  const now = new Date().toISOString();
  let synced = 0;

  for (const template of templates) {
    const name = template.name ?? template.templateName ?? template.template?.name;
    if (!name) continue;

    const content = getProviderTemplateContent(template);
    const providerStatus = (template.status ?? template.approvalStatus ?? template.approval_status ?? 'UNKNOWN').toUpperCase();
    const { error } = await supabase
      .from('Template')
      .upsert({
        id: crypto.randomUUID(),
        name,
        language: template.language ?? template.languageCode ?? 'en',
        content,
        status: providerStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
        category: template.category ?? 'MARKETING',
        provider_name: 'meta',
        provider_template_id: template.id ?? template.template?.id ?? name,
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
  eventContext?: OutboundEventContext,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const { templateLanguage } = getMetaConfig();
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLanguage },
      ...(placeholders.length > 0 ? {
        components: [{ type: 'body', parameters: placeholders.map((text) => ({ type: 'text', text })) }],
      } : {}),
    },
  };

  const event = await OutboundEventService.createEvent(supabase, {
    phone_number: to,
    message_type: 'template',
    message_content: {
      templateName,
      placeholders,
      language: templateLanguage,
    },
    conversation_id: eventContext?.conversationId,
    lead_id: eventContext?.leadId,
    campaign_id: eventContext?.campaignId,
    user_id: eventContext?.userId,
    idempotency_key: eventContext?.idempotencyKey,
    max_retries: eventContext?.maxRetries ?? 3,
  });
  const existingResponse = existingEventResponse(event);
  if (existingResponse) return existingResponse;

  const response = await sendMetaRequest(payload, event.id);
  return response ?? { success: false, error: 'No response from Meta' };
}

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  lastInteractionTimestamp?: string | null,
  eventContext?: OutboundEventContext,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const now = new Date();

  // Use the caller-supplied timestamp (captured before the conversation update)
  // so the 24h check is not defeated by the update that already happened.
  const isOutside24h =
    !lastInteractionTimestamp ||
    now.getTime() - new Date(lastInteractionTimestamp).getTime() > 24 * 60 * 60 * 1000;

  if (isOutside24h) {
    const { templateName } = getMetaConfig();
    return sendTemplateMessage(to, templateName, [text], eventContext);
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  const event = await OutboundEventService.createEvent(supabase, {
    phone_number: to,
    message_type: 'text',
    message_content: { text },
    conversation_id: eventContext?.conversationId,
    lead_id: eventContext?.leadId,
    campaign_id: eventContext?.campaignId,
    user_id: eventContext?.userId,
    idempotency_key: eventContext?.idempotencyKey,
    max_retries: eventContext?.maxRetries ?? 3,
  });
  const existingResponse = existingEventResponse(event);
  if (existingResponse) return existingResponse;

  const response = await sendMetaRequest(payload, event.id);
  return response ?? { success: false, error: 'No response from Meta' };
}

export async function retryOutboundEvent(
  event: OutboundEventRecord,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const content = event.message_content;

  if (event.message_type === 'template') {
    const payload = {
      messaging_product: 'whatsapp',
      to: event.phone_number,
      type: 'template',
      template: {
        name: String(content.templateName ?? ''),
        language: { code: String(content.language ?? getMetaConfig().templateLanguage) },
        components: [{
          type: 'body',
          parameters: (Array.isArray(content.placeholders) ? content.placeholders : []).map((text) => ({ type: 'text', text: String(text) })),
        }],
      },
    };
    return sendMetaRequest(payload, event.id, event.processing_token);
  }

  if (event.message_type === 'text') {
    return sendMetaRequest({
      messaging_product: 'whatsapp',
      to: event.phone_number,
      type: 'text',
      text: { body: String(content.text ?? '') },
    }, event.id, event.processing_token);
  }

  if (event.message_type === 'media') {
    const type = String(content.type ?? 'document');
    if (!['image', 'video', 'audio', 'document'].includes(type)) {
      return { success: false, error: `Unsupported media retry type: ${type}` };
    }
    const mediaContent: Record<string, unknown> = { link: String(content.mediaUrl ?? '') };
    if (content.caption) mediaContent.caption = String(content.caption);
    return sendMetaRequest({
      messaging_product: 'whatsapp',
      to: event.phone_number,
      type,
      [type]: mediaContent,
    }, event.id, event.processing_token);
  }

  if (event.message_type === 'location') {
    return sendMetaRequest({
      messaging_product: 'whatsapp',
      to: event.phone_number,
      type: 'location',
      location: content,
    }, event.id, event.processing_token);
  }

  return { success: false, error: `Unsupported retry message type: ${event.message_type}` };
}

export async function sendWhatsAppMedia(
  to: string,
  type: 'image' | 'video' | 'audio' | 'document',
  mediaUrl: string,
  caption?: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to,
    type,
    [type]: { link: mediaUrl },
  };

  if (caption) (payload[type] as Record<string, unknown>).caption = caption;

  const event = await OutboundEventService.createEvent(supabase, {
    phone_number: to,
    message_type: 'media',
    message_content: { type, mediaUrl, caption: caption ?? null },
  });
  const existingResponse = existingEventResponse(event);
  if (existingResponse) return existingResponse;

  const response = await sendMetaRequest(payload, event.id);

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

  return response ?? { success: false, error: 'No response from Meta' };
}

export async function sendWhatsAppLocation(
  to: string,
  latitude: number,
  longitude: number,
  name?: string,
  address?: string,
): Promise<{ success: boolean; data?: unknown; error?: unknown; status?: number }> {
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to,
    type: 'location',
    location: { latitude, longitude },
  };

  if (name) (payload.location as Record<string, unknown>).name = name;
  if (address) (payload.location as Record<string, unknown>).address = address;

  const event = await OutboundEventService.createEvent(supabase, {
    phone_number: to,
    message_type: 'location',
    message_content: payload.content as Record<string, unknown>,
  });
  const existingResponse = existingEventResponse(event);
  if (existingResponse) return existingResponse;

  const response = await sendMetaRequest(payload, event.id);

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

  return response ?? { success: false, error: 'No response from Meta' };
}
