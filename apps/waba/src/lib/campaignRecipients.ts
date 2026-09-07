export interface CampaignRecipientInput {
  name?: unknown;
  phone?: unknown;
  offer?: unknown;
}

export interface NormalizedCampaignRecipient {
  name: string;
  phone: string;
  offer: string;
}

export function normalizePhone(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;

  return `+${digits}`;
}

export function normalizeCampaignRecipient(input: CampaignRecipientInput): NormalizedCampaignRecipient | null {
  const phone = normalizePhone(input.phone);
  if (!phone) return null;

  return {
    name: String(input.name ?? '').trim() || phone,
    phone,
    offer: String(input.offer ?? '').trim(),
  };
}

export function dedupeCampaignRecipients(inputs: CampaignRecipientInput[]) {
  const seen = new Set<string>();
  const recipients: NormalizedCampaignRecipient[] = [];
  let invalid = 0;
  let duplicates = 0;

  for (const input of inputs) {
    const recipient = normalizeCampaignRecipient(input);
    if (!recipient) {
      invalid++;
      continue;
    }
    if (seen.has(recipient.phone)) {
      duplicates++;
      continue;
    }
    seen.add(recipient.phone);
    recipients.push(recipient);
  }

  return { recipients, invalid, duplicates };
}