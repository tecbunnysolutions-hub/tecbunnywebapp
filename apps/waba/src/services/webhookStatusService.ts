import { supabase } from '@/lib/supabase';

type ProviderEvent = Record<string, unknown>;

const STATUS_MAP: Record<string, string> = {
  sent: 'SENT',
  pending: 'SENT',
  delivered: 'DELIVERED',
  read: 'READ',
  seen: 'READ',
  failed: 'FAILED',
  rejected: 'FAILED',
  undeliverable: 'FAILED',
};

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function extractMessageId(event: ProviderEvent) {
  return getString(event.messageId)
    || getString(event.message_id)
    || getString(event.messageID)
    || getString((event.message as ProviderEvent | undefined)?.id)
    || getString((event.message as ProviderEvent | undefined)?.messageId);
}

function extractStatus(event: ProviderEvent) {
  const statusValue = getString(event.status)
    || getString((event.status as ProviderEvent | undefined)?.name)
    || getString((event.status as ProviderEvent | undefined)?.groupName)
    || getString(event.deliveryStatus)
    || getString(event.event);
  if (!statusValue) return null;
  return STATUS_MAP[statusValue.toLowerCase()] ?? statusValue.toUpperCase();
}

function extractOccurredAt(event: ProviderEvent) {
  const raw = getString(event.doneAt)
    || getString(event.seenAt)
    || getString(event.deliveredAt)
    || getString(event.sentAt)
    || getString(event.receivedAt)
    || getString(event.timestamp);
  const timestamp = raw ? new Date(raw) : new Date();
  return Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
}

export async function processWabaStatusEvents(payload: unknown) {
  if (!payload || typeof payload !== 'object') return 0;
  const record = payload as { results?: ProviderEvent[]; statuses?: ProviderEvent[] };
  const events = Array.isArray(record.statuses) ? record.statuses : Array.isArray(record.results) ? record.results : [];
  let processed = 0;

  for (const event of events) {
    const messageId = extractMessageId(event);
    const status = extractStatus(event);
    if (!messageId || !status) continue;

    const occurredAt = extractOccurredAt(event);
    const { error: eventError } = await supabase.from('waba_message_status_events').insert({
      message_id: messageId,
      status,
      occurred_at: occurredAt,
      provider_payload: event,
    });
    if (eventError) {
      console.warn('[WebhookStatus] Failed to append status event', { messageId, status, error: eventError.message });
    }

    const { error: messageError } = await supabase
      .from('Message')
      .update({ status })
      .eq('message_id', messageId);
    if (messageError) {
      console.warn('[WebhookStatus] Failed to update message status', { messageId, status, error: messageError.message });
    }

    if (status === 'DELIVERED' || status === 'READ' || status === 'FAILED') {
      await supabase
        .from('mkt_campaign_analytics')
        .update({ status })
        .eq('message_id', messageId)
        .then(({ error }) => {
          if (error) console.warn('[WebhookStatus] Campaign status update skipped', { messageId, status, error: error.message });
        });
    }

    processed++;
  }

  return processed;
}