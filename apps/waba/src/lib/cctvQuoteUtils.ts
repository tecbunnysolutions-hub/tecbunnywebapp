export type CameraType = 'Bullet' | 'Dome' | 'PTZ' | 'Fisheye';
export type Resolution = '2MP' | '4MP' | '8MP' | '4K';
export type RecorderType = 'DVR' | 'NVR';
export type Channels = 4 | 8 | 16 | 32;
export type StorageSize = '1TB' | '2TB' | '4TB' | '8TB';
export type InstallType = 'New Install' | 'Upgrade' | 'Add-on';
export type Validity = 7 | 14 | 30;
export type AddonKey = 'anpr' | 'remote' | 'poe' | 'motion' | 'led' | 'intercom';

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

export interface AddonDef {
  key: AddonKey;
  label: string;
  /** -1 = INR 150 per camera */
  price: number;
}

export const ADDON_LIST: AddonDef[] = [
  { key: 'anpr',     label: 'ANPR Plate Recognition',  price: 800 },
  { key: 'remote',   label: 'Remote Viewing App Setup', price: 0   },
  { key: 'poe',      label: 'POE Switch (8-port)',      price: 300 },
  { key: 'motion',   label: 'Smart Motion Alert Setup', price: 0   },
  { key: 'led',      label: 'LED Spotlight Cameras',    price: -1  },
  { key: 'intercom', label: 'Intercom Integration',     price: 500 },
];

export const CAMERA_PRICES: Record<Resolution, Record<CameraType, number>> = {
  '2MP': { Bullet: 180, Dome: 200, PTZ: 700,  Fisheye: 580 },
  '4MP': { Bullet: 250, Dome: 270, PTZ: 800,  Fisheye: 650 },
  '8MP': { Bullet: 380, Dome: 400, PTZ: 950,  Fisheye: 820 },
  '4K':  { Bullet: 500, Dome: 550, PTZ: 1200, Fisheye: 980 },
};

export const RECORDER_PRICES: Record<RecorderType, Record<Channels, number>> = {
  DVR: { 4: 350, 8: 450, 16: 650,  32: 900  },
  NVR: { 4: 400, 8: 500, 16: 750,  32: 1100 },
};

export const STORAGE_PRICES: Record<StorageSize, number> = {
  '1TB': 180, '2TB': 280, '4TB': 420, '8TB': 650,
};

export const INSTALL_PRICES: Record<InstallType, number> = {
  'New Install': 500, Upgrade: 300, 'Add-on': 200,
};

export interface QuoteBreakdown {
  cameraUnit: number;
  cameraTotal: number;
  recorderTotal: number;
  storageTotal: number;
  cableTotal: number;
  installTotal: number;
  addonBreakdown: { label: string; price: number }[];
  addonTotal: number;
  total: number;
}

export function calcBreakdown(cfg: CCTVQuoteConfig): QuoteBreakdown {
  const cameraUnit  = CAMERA_PRICES[cfg.resolution][cfg.cameraType];
  const cameraTotal = cameraUnit * cfg.cameraCount;
  const recorderTotal = RECORDER_PRICES[cfg.recorder][cfg.channels];
  const storageTotal  = STORAGE_PRICES[cfg.storage];
  const cableTotal    = cfg.cableRun * 2;
  const installTotal  = INSTALL_PRICES[cfg.installType];

  const addonBreakdown = ADDON_LIST
    .filter(a => cfg.addons.has(a.key))
    .map(a => ({ label: a.label, price: a.price === -1 ? 150 * cfg.cameraCount : a.price }));
  const addonTotal = addonBreakdown.reduce((s, a) => s + a.price, 0);

  return {
    cameraUnit, cameraTotal, recorderTotal, storageTotal,
    cableTotal, installTotal, addonBreakdown, addonTotal,
    total: cameraTotal + recorderTotal + storageTotal + cableTotal + installTotal + addonTotal,
  };
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function genRef(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-${stamp}-${rand}`;
}

export function buildQuoteText(
  cfg: CCTVQuoteConfig,
  bd: QuoteBreakdown,
  quoteRef: string,
  customerName: string,
): string {
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines: (string | null)[] = [
    `📷 *CCTV Security System Quotation*`,
    `Ref: ${quoteRef}`,
    `Date: ${dateStr} | Valid for ${cfg.validity} days`,
    ``,
    cfg.site ? `📍 *Site:* ${cfg.site}` : null,
    customerName ? `👤 *Prepared for:* ${customerName}` : null,
    `🏷️ *Installation Type:* ${cfg.installType}`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `📦 *System Breakdown*`,
    `━━━━━━━━━━━━━━━━━━`,
    `• Cameras: ${cfg.cameraCount}x ${cfg.resolution} ${cfg.cameraType} — ${formatINR(bd.cameraTotal)}`,
    `• Recorder: ${cfg.recorder} ${cfg.channels}-Channel — ${formatINR(bd.recorderTotal)}`,
    `• Storage: ${cfg.storage} HDD — ${formatINR(bd.storageTotal)}`,
    `• Cable Run (${cfg.cableRun}m) — ${formatINR(bd.cableTotal)}`,
    `• ${cfg.installType} — ${formatINR(bd.installTotal)}`,
    bd.addonBreakdown.length > 0 ? `\n🔧 *Add-ons:*` : null,
    ...bd.addonBreakdown.map(a =>
      `• ${a.label}${a.price > 0 ? ` — ${formatINR(a.price)}` : ' — Included'}`
    ),
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💰 *Estimated Total: ${formatINR(bd.total)}*`,
    `━━━━━━━━━━━━━━━━━━`,
    cfg.notes.trim() ? `\n📝 *Notes:* ${cfg.notes.trim()}` : null,
    ``,
    `For enquiries, reply to this message or call us directly. Thank you! 🙏`,
  ];
  return lines.filter(l => l !== null).join('\n');
}
