import { createServiceClient } from '@tecbunny/database/admin';
import { OutboundEventService } from './services/outbound-event.service';

type SendResult = { messages?: Array<{ id?: string; messageId?: string }> };

function getConfig() {
  const baseUrl = process.env.INFOBIP_BASE_URL?.replace(/^https?:\/\//, '');
  const apiKey = process.env.INFOBIP_API_KEY;
  const from = process.env.INFOBIP_WHATSAPP_FROM;
  if (!baseUrl || !apiKey || !from) {
    throw new Error('INFOBIP_BASE_URL, INFOBIP_API_KEY, and INFOBIP_WHATSAPP_FROM are required');
  }
  return { url: `https://${baseUrl}/whatsapp/1/message/text`, apiKey, from };
}

async function sendNotification(...args: unknown[]) {
  const strings = args.filter((value): value is string => typeof value === 'string');
  const phone = strings.find((value) => /^\+?\d{10,15}$/.test(value.replace(/\s/g, '')));
  const text = strings.filter((value) => value !== phone).pop();
  if (!phone || !text) throw new Error('WhatsApp notification requires a recipient phone and message');
  return new WhatsAppService().sendMessage(phone.replace(/\s/g, ''), text);
}

export const sendWhatsAppNotification = sendNotification;
export const sendShipmentNotification = sendNotification;
export const sendPaymentActionRequired = sendNotification;
export const sendPaymentConfirmationNotification = sendNotification;
export const sendOrderCancelled = sendNotification;
export const sendOrderDelayed = sendNotification;
export const sendOrderActionNeeded = sendNotification;
export const sendOrderPickupReady = sendNotification;
export const sendDeliveryConfirmation = sendNotification;
export const sendPaymentReminder = sendNotification;
export const sendWelcomeNotification = sendNotification;
export const sendOrderNotification = sendNotification;
export const sendOrderStatusUpdate = sendNotification;
export const sendPickupNotification = sendNotification;
export const sendOutForDeliveryNotification = sendNotification;

export class WhatsAppService {
  private readonly supabase = createServiceClient();

  async checkWhatsAppConsent(phone: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('waba_contact_consent')
      .select('opted_in, opted_out_at')
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw new Error(`Consent lookup failed: ${error.message}`);
    return Boolean(data?.opted_in && !data.opted_out_at);
  }

  async sendMessage(phone: string, text: string, messageType: 'text' = 'text') {
    if (messageType !== 'text') throw new Error(`Unsupported WhatsApp message type: ${messageType}`);
    const event = await OutboundEventService.createEvent(this.supabase, {
      phone_number: phone,
      message_type: 'text',
      message_content: { text },
    });
    if (event.status === 'DELIVERED') {
      return { messages: [{ id: event.provider_message_id ?? undefined }] };
    }

    await OutboundEventService.markProcessing(this.supabase, event.id);
    const { url, apiKey, from } = getConfig();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `App ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ from, to: phone, content: { text } }),
      });
      const data = await response.json().catch(() => ({})) as SendResult;
      if (!response.ok) {
        await OutboundEventService.markFailedAndScheduleRetry(this.supabase, event.id, String(response.status), JSON.stringify(data));
        throw new Error(`Infobip send failed with status ${response.status}`);
      }
      const providerMessageId = data.messages?.[0]?.messageId ?? data.messages?.[0]?.id ?? 'unknown';
      await OutboundEventService.markDelivered(this.supabase, event.id, providerMessageId, String(response.status));
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Infobip send failed')) throw error;
      await OutboundEventService.markFailedAndScheduleRetry(this.supabase, event.id, 'NETWORK_ERROR', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async sendOTP(phone: string, code: string) {
    return this.sendMessage(phone, `Your TecBunny verification code is ${code}`, 'text');
  }
}