/**
 * Campaign recipient normalization & deduplication helpers for the WABA app.
 *
 * Reconstructed module — consumed by apps/waba/src/app/api/campaigns/route.ts
 * for CSV-imported recipient lists. Phone numbers are normalized to digits
 * only; 10-digit numbers are assumed to be Indian local numbers and get the
 * `+91` country code prepended.
 */

export interface CampaignRecipientInput {
  phone?: string | number | null;
  name?: string | null;
  offer?: string | null;
}

export interface CampaignRecipient {
  phone: string;
  name: string | null;
  offer: string;
}

export interface DedupeCampaignRecipientsResult {
  invalid: number;
  duplicates: number;
  recipients: CampaignRecipient[];
}

/** Country code prepended to 10-digit local numbers. */
const DEFAULT_COUNTRY_CODE = '91';

/** E.164-style sanity check: 10-15 digits, no leading zero. */
const VALID_PHONE_PATTERN = /^[1-9]\d{9,14}$/;

function normalizePhone(raw: CampaignRecipientInput['phone']): string | null {
  if (raw === null || raw === undefined) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  // 10-digit local number -> assume India (+91).
  const normalized = digits.length === 10 ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;

  return VALID_PHONE_PATTERN.test(normalized) ? normalized : null;
}

function normalizeName(raw: CampaignRecipientInput['name']): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOffer(raw: CampaignRecipientInput['offer']): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

/**
 * Normalize, validate and dedupe imported campaign recipients.
 * Dedupe key is the normalized phone number; the first occurrence wins.
 */
export function dedupeCampaignRecipients(
  input: CampaignRecipientInput[],
): DedupeCampaignRecipientsResult {
  const seen = new Set<string>();
  const recipients: CampaignRecipient[] = [];
  let invalid = 0;
  let duplicates = 0;

  for (const item of input || []) {
    const phone = normalizePhone(item?.phone);
    if (!phone) {
      invalid += 1;
      continue;
    }
    if (seen.has(phone)) {
      duplicates += 1;
      continue;
    }
    seen.add(phone);
    recipients.push({
      phone,
      name: normalizeName(item?.name),
      offer: normalizeOffer(item?.offer),
    });
  }

  return { invalid, duplicates, recipients };
}
