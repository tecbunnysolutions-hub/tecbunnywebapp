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
  /** -1 = RM 150 per camera */
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

export function formatRM(n: number): string {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0 })}`;
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
  const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
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
    `• Cameras: ${cfg.cameraCount}x ${cfg.resolution} ${cfg.cameraType} — ${formatRM(bd.cameraTotal)}`,
    `• Recorder: ${cfg.recorder} ${cfg.channels}-Channel — ${formatRM(bd.recorderTotal)}`,
    `• Storage: ${cfg.storage} HDD — ${formatRM(bd.storageTotal)}`,
    `• Cable Run (${cfg.cableRun}m) — ${formatRM(bd.cableTotal)}`,
    `• ${cfg.installType} — ${formatRM(bd.installTotal)}`,
    bd.addonBreakdown.length > 0 ? `\n🔧 *Add-ons:*` : null,
    ...bd.addonBreakdown.map(a =>
      `• ${a.label}${a.price > 0 ? ` — ${formatRM(a.price)}` : ' — Included'}`
    ),
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💰 *Estimated Total: ${formatRM(bd.total)}*`,
    `━━━━━━━━━━━━━━━━━━`,
    cfg.notes.trim() ? `\n📝 *Notes:* ${cfg.notes.trim()}` : null,
    ``,
    `For enquiries, reply to this message or call us directly. Thank you! 🙏`,
  ];
  return lines.filter(l => l !== null).join('\n');
}

export async function downloadQuotePDF(
  cfg: CCTVQuoteConfig,
  bd: QuoteBreakdown,
  quoteRef: string,
  customerName: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CCTV Security System Quotation', margin, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Powered by Tecbunny', margin, 24);
  doc.text(`Ref: ${quoteRef}`, W - margin, 24, { align: 'right' });
  const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Date: ${dateStr}   Valid: ${cfg.validity} days`, W - margin, 30, { align: 'right' });

  y = 46;

  // ── Customer / Site block ─────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  doc.setTextColor(96, 165, 250);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', margin + 5, y + 7);
  doc.text('INSTALLATION SITE', margin + contentW / 2 + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(10);
  doc.text(customerName || '—', margin + 5, y + 15);
  doc.text(cfg.site || '—', margin + contentW / 2 + 5, y + 15);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  doc.text(`Installation Type: ${cfg.installType}`, margin + 5, y + 21);

  y += 30;

  // ── Section title helper ──────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, y, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(96, 165, 250);
    doc.text(title, margin + 6, y + 5);
    y += 11;
  };

  // ── System Breakdown table ────────────────────────────────────
  sectionTitle('SYSTEM BREAKDOWN');

  const rows: [string, string, string, string][] = [
    [
      `${cfg.cameraCount}× ${cfg.resolution} ${cfg.cameraType} Camera`,
      `${formatRM(bd.cameraUnit)} each`,
      `${cfg.cameraCount} unit${cfg.cameraCount > 1 ? 's' : ''}`,
      formatRM(bd.cameraTotal),
    ],
    [
      `${cfg.recorder} ${cfg.channels}-Channel Recorder`,
      '', '1 unit', formatRM(bd.recorderTotal),
    ],
    [
      `${cfg.storage} HDD Storage`,
      '', '1 unit', formatRM(bd.storageTotal),
    ],
    [
      `Cabling & Conduit (${cfg.cableRun}m)`,
      'RM 2/m', `${cfg.cableRun}m`, formatRM(bd.cableTotal),
    ],
    [
      `${cfg.installType} Labour`,
      '', '1 job', formatRM(bd.installTotal),
    ],
  ];

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('ITEM', margin + 3, y + 5);
  doc.text('UNIT PRICE', margin + 90, y + 5);
  doc.text('QTY', margin + 120, y + 5);
  doc.text('AMOUNT', W - margin - 3, y + 5, { align: 'right' });
  y += 7;

  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentW, 8, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(row[0], margin + 3, y + 5.5);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(row[1], margin + 90, y + 5.5);
    doc.text(row[2], margin + 120, y + 5.5);
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(9);
    doc.text(row[3], W - margin - 3, y + 5.5, { align: 'right' });
    y += 8;
  });

  y += 4;

  // ── Add-ons ───────────────────────────────────────────────────
  if (bd.addonBreakdown.length > 0) {
    sectionTitle('ADD-ONS & EXTRAS');

    bd.addonBreakdown.forEach((addon, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, y, contentW, 8, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(addon.label, margin + 3, y + 5.5);
      doc.setTextColor(226, 232, 240);
      doc.text(addon.price === 0 ? 'Included' : formatRM(addon.price), W - margin - 3, y + 5.5, { align: 'right' });
      y += 8;
    });

    y += 4;
  }

  // ── Total box ─────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(226, 232, 240);
  doc.text('ESTIMATED TOTAL', margin + 5, y + 9);
  doc.setTextColor(96, 165, 250);
  doc.setFontSize(13);
  doc.text(formatRM(bd.total), W - margin - 5, y + 9.5, { align: 'right' });
  y += 20;

  // ── Notes ─────────────────────────────────────────────────────
  if (cfg.notes.trim()) {
    sectionTitle('NOTES');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    const wrapped = doc.splitTextToSize(cfg.notes.trim(), contentW - 6);
    doc.text(wrapped, margin + 3, y);
    y += wrapped.length * 5 + 6;
  }

  // ── Footer ────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 282, W, 15, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `This is an estimated quotation valid for ${cfg.validity} days from the date of issue. Prices are subject to site survey confirmation.`,
    W / 2, 288, { align: 'center' }
  );
  doc.text('Tecbunny Sdn Bhd  |  www.tecbunny.com', W / 2, 293, { align: 'center' });

  doc.save(`CCTV-Quote-${quoteRef}.pdf`);
}
