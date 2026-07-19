import { supabase } from '@/lib/supabase';

const OPT_OUT_KEYWORDS = new Set(['stop', 'unsubscribe', 'opt out', 'opt-out', 'cancel']);

function normalizeKeyword(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isOptOutMessage(text: string) {
  return OPT_OUT_KEYWORDS.has(normalizeKeyword(text));
}

export async function recordInboundConsent(phone: string, text: string) {
  const optedOut = isOptOutMessage(text);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('waba_contact_consent')
    .upsert({
      phone,
      opted_in: !optedOut,
      source: optedOut ? 'inbound_opt_out' : 'inbound_message',
      last_opt_in_at: optedOut ? null : now,
      opted_out_at: optedOut ? now : null,
      updated_at: now,
    }, { onConflict: 'phone' });

  if (error) {
    console.warn('[Consent] Failed to record inbound consent state', { phone, error: error.message });
  }
}

export async function hasBroadcastConsent(phone: string) {
  const { data, error } = await supabase
    .from('waba_contact_consent')
    .select('opted_in, opted_out_at')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    console.warn('[Consent] Failed to verify broadcast consent', { phone, error: error.message });
    return false;
  }

  return Boolean(data?.opted_in && !data.opted_out_at);
}