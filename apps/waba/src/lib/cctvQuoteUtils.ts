/**
 * CCTV quotation builder utilities for the WABA app.
 *
 * Reconstructed module — consumed by apps/waba/src/app/cctv-quote/page.tsx and
 * apps/waba/src/components/waba/CCTVQuoteModal.tsx.
 *
 * NOTE ON PRICING: the original price list could not be recovered. All rates
 * below are PLACEHOLDERS based on sensible Indian market rates and must be
 * reviewed/tuned before production use. Everything here is deterministic and
 * pure (no I/O), except `genRef` which generates a random quote reference.
 */

export type CameraType = 'Bullet' | 'Dome' | 'PTZ' | 'Fisheye';
export type Resolution = '2MP' | '4MP' | '8MP' | '4K';
export type RecorderType = 'NVR' | 'DVR';
export type Channels = 4 | 8 | 16 | 32;
export type StorageSize = '1TB' | '2TB' | '4TB' | '8TB';
export type InstallType = 'New Install' | 'Upgrade' | 'Add-on';
export type Validity = 7 | 14 | 30;

export type AddonKey =
  | 'remoteView'
  | 'poeSwitch'
  | 'upsBackup'
  | 'monitor'
  | 'audioMic'
  | 'amcPlan';

export interface CCTVQuoteConfig {
  site: string;
  cameraCount: number;
  cameraType: CameraType;
  resolution: Resolution;
  recorder: RecorderType;
  channels: Channels;
  storage: StorageSize;
  cableRun: number;
  installType: InstallType;
  addons: Set<AddonKey>;
  validity: Validity;
  notes: string;
}

export interface CCTVBreakdown {
  cameraUnit: number;
  cameraTotal: number;
  recorderTotal: number;
  storageTotal: number;
  cableTotal: number;
  installTotal: number;
  addonBreakdown: Array<{ label: string; price: number }>;
  total: number;
}

export interface CCTVAddon {
  key: AddonKey;
  label: string;
  /** Price in INR. `-1` = priced per camera, `0` = free/included. */
  price: number;
}

// ── Placeholder pricing (INR) — TUNE BEFORE PRODUCTION ──────────────

/** Per-camera add-on rate used when an addon price is `-1` (₹150/camera). */
const PER_CAMERA_ADDON_PRICE = 150;

/** Base camera unit price at 2MP, by camera type (placeholder rates). */
const CAMERA_BASE_PRICE: Record<CameraType, number> = {
  Dome: 1500,
  Bullet: 1650,
  PTZ: 7000,
  Fisheye: 3800,
};

/** Resolution multiplier applied on the base camera price. */
const RESOLUTION_MULTIPLIER: Record<Resolution, number> = {
  '2MP': 1,
  '4MP': 1.2,
  '8MP': 1.6,
  '4K': 1.8,
};

/** Recorder base price at 4 channels, by recorder type (placeholder rates). */
const RECORDER_BASE_PRICE: Record<RecorderType, number> = {
  NVR: 6500,
  DVR: 4500,
};

/** Channel-count multiplier applied on the recorder base price. */
const CHANNEL_MULTIPLIER: Record<Channels, number> = {
  4: 1,
  8: 1.2,
  16: 1.5,
  32: 2,
};

/** HDD storage price by capacity (placeholder rates). */
const STORAGE_PRICE: Record<StorageSize, number> = {
  '1TB': 3500,
  '2TB': 5500,
  '4TB': 9000,
  '8TB': 16000,
};

/** Cable & conduit rate per metre (consumer UI hardcodes the "₹2/m" label). */
const CABLE_RATE_PER_METRE = 2;

/** Installation labour per camera, by install type (placeholder rates). */
const INSTALL_RATE_PER_CAMERA: Record<InstallType, number> = {
  'New Install': 500,
  Upgrade: 300,
  'Add-on': 400,
};

/**
 * Add-on catalogue. `price: -1` means "per camera" (charged at
 * PER_CAMERA_ADDON_PRICE × cameraCount); `price: 0` means free/included.
 * Placeholder rates — tune before production.
 */
export const ADDON_LIST: CCTVAddon[] = [
  { key: 'remoteView', label: 'Mobile Remote View Setup', price: 0 },
  { key: 'poeSwitch', label: 'PoE Switch', price: 2500 },
  { key: 'upsBackup', label: 'UPS Power Backup', price: 4500 },
  { key: 'monitor', label: '19" Surveillance Monitor', price: 6500 },
  { key: 'audioMic', label: 'Audio Microphone', price: -1 },
  { key: 'amcPlan', label: '1-Year AMC Plan', price: 3000 },
];

// ── Calculations ────────────────────────────────────────────────────

function roundTo10(value: number): number {
  return Math.round(value / 10) * 10;
}

export function calcBreakdown(cfg: CCTVQuoteConfig): CCTVBreakdown {
  const cameraUnit = roundTo10(
    CAMERA_BASE_PRICE[cfg.cameraType] * RESOLUTION_MULTIPLIER[cfg.resolution],
  );
  const cameraTotal = cameraUnit * cfg.cameraCount;

  const recorderTotal = roundTo10(
    RECORDER_BASE_PRICE[cfg.recorder] * CHANNEL_MULTIPLIER[cfg.channels],
  );
  const storageTotal = STORAGE_PRICE[cfg.storage];
  const cableTotal = Math.max(0, cfg.cableRun) * CABLE_RATE_PER_METRE;
  const installTotal = INSTALL_RATE_PER_CAMERA[cfg.installType] * cfg.cameraCount;

  const addonBreakdown = ADDON_LIST.filter((addon) => cfg.addons.has(addon.key)).map(
    (addon) => ({
      label: addon.label,
      price:
        addon.price === -1
          ? PER_CAMERA_ADDON_PRICE * cfg.cameraCount
          : addon.price,
    }),
  );

  const total =
    cameraTotal +
    recorderTotal +
    storageTotal +
    cableTotal +
    installTotal +
    addonBreakdown.reduce((sum, addon) => sum + addon.price, 0);

  return {
    cameraUnit,
    cameraTotal,
    recorderTotal,
    storageTotal,
    cableTotal,
    installTotal,
    addonBreakdown,
    total,
  };
}

// ── Formatting ──────────────────────────────────────────────────────

/** Format a number as Indian Rupees with en-IN digit grouping (e.g. ₹1,800). */
export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Generate a quote reference like `TB-CCTV-XXXXXX`. */
export function genRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TB-CCTV-${suffix}`;
}

/** Build the multi-line WhatsApp quote message. */
export function buildQuoteText(
  cfg: CCTVQuoteConfig,
  breakdown: CCTVBreakdown,
  quoteRef: string,
  customerName: string,
): string {
  const lines: string[] = [
    '*📷 CCTV Quotation — TecBunny*',
    `Ref: ${quoteRef}`,
    `Customer: ${customerName.trim() || 'Valued Customer'}`,
    `Site: ${cfg.site.trim() || 'To be confirmed'}`,
    '',
    '*Configuration & Pricing*',
    `• ${cfg.cameraCount}× ${cfg.resolution} ${cfg.cameraType} Camera @ ${formatINR(breakdown.cameraUnit)} each = ${formatINR(breakdown.cameraTotal)}`,
    `• ${cfg.recorder} ${cfg.channels}-Channel Recorder = ${formatINR(breakdown.recorderTotal)}`,
    `• ${cfg.storage} HDD Storage = ${formatINR(breakdown.storageTotal)}`,
    `• Cabling & Conduit (${cfg.cableRun}m @ ₹2/m) = ${formatINR(breakdown.cableTotal)}`,
    `• ${cfg.installType} Labour = ${formatINR(breakdown.installTotal)}`,
  ];

  if (breakdown.addonBreakdown.length > 0) {
    lines.push('', '*Add-ons*');
    for (const addon of breakdown.addonBreakdown) {
      lines.push(
        `• ${addon.label} = ${addon.price === 0 ? 'Included' : formatINR(addon.price)}`,
      );
    }
  }

  lines.push(
    '',
    `*Estimated Total: ${formatINR(breakdown.total)}*`,
    `This quote is valid for ${cfg.validity} days.`,
  );

  if (cfg.notes.trim()) {
    lines.push('', `Notes: ${cfg.notes.trim()}`);
  }

  return lines.join('\n');
}
