import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LineItem { description: string; mrp: number; sale: number; }
interface PDFBody {
  systemLabel: string;
  cameraCount: number;
  breakdown: string[];
  items: LineItem[];
  saleTotalOverall: number;
  mrpTotalOverall: number;
  discountAmount: number;
  discountPercent: number;
}

function inr(n: number) {
  // Avoid en-IN locale (not available in all Node builds); format manually
  return `Rs. ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/** Strip characters outside WinAnsi range (pdf-lib Helvetica limitation) */
function safe(s: string): string {
  return s
    .replace(/[\u20B9]/g, 'Rs.')   // ₹
    .replace(/[\u2014]/g, '-')     // em dash
    .replace(/[\u2013]/g, '-')     // en dash
    .replace(/[\u00D7]/g, 'x')     // × multiplication sign (safe but convert for clarity)
    .replace(/[^\x00-\xFF]/g, '?');
}

export async function POST(req: NextRequest) {
  let body: PDFBody;
  try {
    body = await req.json() as PDFBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { systemLabel, cameraCount, breakdown, items, saleTotalOverall, mrpTotalOverall, discountAmount, discountPercent } = body;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { height } = page.getSize();
  const W = 595;
  const ML = 48;
  const MR = 48;
  const CW = W - ML - MR;

  const fontReg  = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const dark    = rgb(0.059, 0.090, 0.165);
  const mid     = rgb(0.118, 0.161, 0.231);
  const rowAlt  = rgb(0.945, 0.953, 0.965); // light grey for odd rows
  const rowDark = rgb(0.231, 0.267, 0.322); // dark row for even rows
  const accent  = rgb(0.231, 0.510, 0.980);
  const accentL = rgb(0.376, 0.647, 0.980);
  const emerald = rgb(0.133, 0.773, 0.369);
  const emeraldD= rgb(0.043, 0.353, 0.173);
  const white   = rgb(1, 1, 1);
  const grey    = rgb(0.580, 0.639, 0.722);
  const inkDark = rgb(0.133, 0.157, 0.192); // dark text for light rows
  const inkMid  = rgb(0.392, 0.455, 0.545);
  const light   = rgb(0.882, 0.902, 0.925);

  const t = (str: string, x: number, y: number, size: number, font = fontReg, color = inkDark) =>
    page.drawText(safe(String(str)), { x, y: height - y, size, font, color });
  const tR = (str: string, x: number, y: number, size: number, font = fontReg, color = inkDark) => {
    const s = safe(String(str));
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: x - w, y: height - y, size, font, color });
  };
  const rect = (x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) =>
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color });

  // ── HEADER: logo mark + firm name + document title ────────────
  rect(0, 0, W, 72, dark);

  // Logo mark: filled square with "T"
  rect(ML, 10, 42, 42, accent);
  const tLabel = 'T';
  const tLabelW = fontBold.widthOfTextAtSize(tLabel, 26);
  t(tLabel, ML + (42 - tLabelW) / 2, 38, 26, fontBold, white);

  // Firm name block
  t('TECBUNNY', ML + 52, 24, 18, fontBold, white);
  t('Solutions Pvt Ltd', ML + 52, 40, 9, fontReg, grey);
  t('GSTIN: 30AAMCT16886IZO  |  www.tecbunny.com', ML + 52, 54, 7.5, fontReg, rgb(0.420, 0.490, 0.580));

  // Divider
  page.drawLine({ start: { x: ML + 52, y: height - 44 }, end: { x: ML + 52, y: height - 44 }, thickness: 0, color: dark });
  page.drawLine({ start: { x: ML + 168, y: height - 20 }, end: { x: ML + 168, y: height - 60 }, thickness: 0.5, color: rgb(0.200, 0.270, 0.380) });

  // Document type + date (right side)
  const today = new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  tR('PRICE ESTIMATE', W - MR, 26, 10, fontBold, light);
  tR('CCTV Customised Setup', W - MR, 40, 8.5, fontReg, grey);
  tR(today, W - MR, 54, 8, fontReg, grey);

  // ── Sub-header: light band below header ─────────────────────
  rect(0, 72, W, 22, mid);
  t('Prices are indicative and subject to final site survey confirmation.  Valid for 14 days.', ML, 87, 7.5, fontReg, grey);
  tR('Headquarters: Nhayginwada, Parse, Pernem, Goa', W - MR, 87, 7.5, fontReg, grey);

  // ── Config block ────────────────────────────────────────────
  let y = 106;
  rect(ML, y, CW, 30, rgb(0.200, 0.267, 0.400));
  rect(ML, y, 5, 30, accent);
  t('SYSTEM CONFIGURATION', ML + 12, y + 11, 8, fontBold, accentL);
  t(`${systemLabel} System  |  ${cameraCount} Camera${cameraCount > 1 ? 's' : ''}`, ML + 12, y + 24, 11, fontBold, white);
  y += 38;

  // Breakdown lines
  t('System Breakdown', ML, y + 10, 8.5, fontBold, inkMid);
  y += 16;
  breakdown.forEach(line => {
    t(`- ${safe(line)}`, ML + 8, y + 9, 8, fontReg, inkMid);
    y += 12;
  });
  y += 8;

  // ── Items table ─────────────────────────────────────────────
  // Table header row
  rect(ML, y, CW, 14, dark);
  t('ITEM', ML + 6, y + 10, 7.5, fontBold, grey);
  tR('MRP', ML + CW - 82, y + 10, 7.5, fontBold, grey);
  tR('SALE PRICE', ML + CW - 4, y + 10, 7.5, fontBold, grey);
  y += 14;

  // Alternating rows with proper contrast
  items.forEach((item, i) => {
    const isEven = i % 2 === 0;
    rect(ML, y, CW, 15, isEven ? rowDark : rowAlt);
    const textColor = isEven ? light : inkDark;
    const mutedColor = isEven ? grey : inkMid;
    t(safe(item.description), ML + 6, y + 11, 8.5, fontReg, textColor);
    tR(item.mrp > 0 ? inr(item.mrp) : '-', ML + CW - 82, y + 11, 8, fontReg, mutedColor);
    tR(inr(item.sale), ML + CW - 4, y + 11, 9, fontBold, textColor);
    y += 15;
  });

  // Thin divider below table
  page.drawLine({ start: { x: ML, y: height - y }, end: { x: ML + CW, y: height - y }, thickness: 0.5, color: grey });
  y += 10;

  // ── Totals block ─────────────────────────────────────────────
  rect(ML, y, CW, 52, dark);
  rect(ML, y, 5, 52, emerald);

  // MRP total row
  t('MRP Total', ML + 12, y + 13, 9, fontReg, grey);
  tR(inr(mrpTotalOverall), ML + CW - 6, y + 13, 9, fontReg, grey);

  // Divider
  page.drawLine({ start: { x: ML + 10, y: height - y - 17 }, end: { x: ML + CW - 6, y: height - y - 17 }, thickness: 0.4, color: rgb(0.200, 0.270, 0.380) });

  // Savings row
  t('Savings', ML + 12, y + 28, 9, fontReg, emerald);
  tR(`- ${inr(discountAmount)} (${discountPercent >= 10 ? discountPercent.toFixed(0) : discountPercent.toFixed(1)}%)`, ML + CW - 6, y + 28, 9, fontBold, emerald);

  // Sale total row
  page.drawLine({ start: { x: ML + 10, y: height - y - 33 }, end: { x: ML + CW - 6, y: height - y - 33 }, thickness: 0.4, color: rgb(0.200, 0.270, 0.380) });
  t('SALE TOTAL', ML + 12, y + 47, 12, fontBold, white);
  tR(inr(saleTotalOverall), ML + CW - 6, y + 48, 14, fontBold, accentL);
  y += 60;

  // ── Savings callout ───────────────────────────────────────────
  rect(ML, y, CW, 18, emeraldD);
  t(`You save ${inr(discountAmount)} on this configuration vs. individual MRP pricing.`, ML + 10, y + 13, 8.5, fontReg, emerald);
  y += 26;

  // ── Footer ────────────────────────────────────────────────────
  rect(0, 812, W, 30, dark);
  const f1 = 'This is an indicative estimate. Prices subject to final site survey. GST applicable as per category.';
  const f1w = fontReg.widthOfTextAtSize(safe(f1), 7);
  t(f1, (W - f1w) / 2, 824, 7, fontReg, grey);
  const f2 = 'Tecbunny Solutions Pvt Ltd  |  GSTIN: 30AAMCT16886IZO  |  www.tecbunny.com';
  const f2w = fontReg.widthOfTextAtSize(safe(f2), 7.5);
  t(f2, (W - f2w) / 2, 836, 7.5, fontReg, grey);

  const bytes = await doc.save();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="tecbunny-cctv-estimate.pdf"',
      'Content-Length': bytes.byteLength.toString(),
    },
  });
}
