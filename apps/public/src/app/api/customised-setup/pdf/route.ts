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
  return `\u20B9${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
  const accent  = rgb(0.231, 0.510, 0.980);
  const accentL = rgb(0.376, 0.647, 0.980);
  const emerald = rgb(0.133, 0.773, 0.369);
  const white   = rgb(1, 1, 1);
  const grey    = rgb(0.580, 0.639, 0.722);
  const light   = rgb(0.882, 0.902, 0.925);
  const slate   = rgb(0.392, 0.455, 0.545);
  const red     = rgb(0.867, 0.298, 0.298);

  const t = (str: string, x: number, y: number, size: number, font = fontReg, color = light) =>
    page.drawText(String(str), { x, y: height - y, size, font, color });
  const tR = (str: string, x: number, y: number, size: number, font = fontReg, color = light) => {
    const w = font.widthOfTextAtSize(String(str), size);
    page.drawText(String(str), { x: x - w, y: height - y, size, font, color });
  };
  const rect = (x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) =>
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color });

  // ── Header ──────────────────────────────────────────────────
  rect(0, 0, W, 56, dark);
  t('Customised CCTV Setup — Price Estimate', ML, 20, 15, fontBold, white);
  t('Tecbunny Solutions Pvt Ltd  ·  www.tecbunny.com', ML, 38, 8.5, fontReg, grey);
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  tR(today, W - MR, 38, 8.5, fontReg, grey);
  t('Prices are indicative. Final cost confirmed after site survey.', ML, 50, 7.5, fontReg, slate);

  // ── Config block ────────────────────────────────────────────
  let y = 72;
  rect(ML, y, CW, 28, mid);
  rect(ML, y, 4, 28, accent);
  t('SYSTEM CONFIGURATION', ML + 10, y + 10, 8, fontBold, accentL);
  t(`${systemLabel} System  ·  ${cameraCount} Camera${cameraCount > 1 ? 's' : ''}`, ML + 10, y + 22, 10, fontReg, white);
  y += 36;

  // Breakdown lines
  t('System Breakdown', ML, y + 10, 8.5, fontBold, grey);
  y += 14;
  breakdown.forEach(line => {
    t(`– ${line}`, ML + 4, y + 9, 8, fontReg, slate);
    y += 12;
  });
  y += 6;

  // ── Items table ─────────────────────────────────────────────
  rect(ML, y, CW, 13, mid);
  t('ITEM', ML + 4, y + 10, 7.5, fontBold, grey);
  tR('MRP', ML + CW - 80, y + 10, 7.5, fontBold, grey);
  tR('SALE PRICE', ML + CW - 4, y + 10, 7.5, fontBold, grey);
  y += 13;

  items.forEach((item, i) => {
    if (i % 2 === 0) rect(ML, y, CW, 14, dark);
    t(item.description, ML + 4, y + 10, 8.5, fontReg, light);
    tR(item.mrp > 0 ? inr(item.mrp) : '—', ML + CW - 80, y + 10, 8, fontReg, slate);
    tR(inr(item.sale), ML + CW - 4, y + 10, 9, fontReg, light);
    y += 14;
  });
  y += 6;

  // ── Totals ──────────────────────────────────────────────────
  rect(ML, y, CW, 44, mid);
  rect(ML, y, 4, 44, emerald);
  t('MRP TOTAL', ML + 10, y + 12, 8, fontBold, grey);
  tR(inr(mrpTotalOverall), ML + CW - 8, y + 12, 9, fontReg, slate);
  page.drawLine({ start: { x: ML + 8, y: height - y - 17 }, end: { x: ML + CW - 8, y: height - y - 17 }, thickness: 0.4, color: slate });
  t('SAVINGS', ML + 10, y + 26, 8, fontBold, grey);
  tR(`– ${inr(discountAmount)} (${discountPercent >= 10 ? discountPercent.toFixed(0) : discountPercent.toFixed(1)}%)`, ML + CW - 8, y + 26, 9, fontReg, emerald);
  t('SALE TOTAL', ML + 10, y + 39, 11, fontBold, white);
  tR(inr(saleTotalOverall), ML + CW - 8, y + 40, 13, fontBold, accentL);
  y += 52;

  // ── Savings callout ─────────────────────────────────────────
  rect(ML, y, CW, 16, rgb(0.055, 0.310, 0.169));
  const savingsLine = `You save ${inr(discountAmount)} on this configuration vs. individual MRP pricing.`;
  t(savingsLine, ML + 8, y + 11, 8, fontReg, emerald);
  y += 24;

  // ── Footer ──────────────────────────────────────────────────
  rect(0, 812, W, 30, dark);
  const f1 = 'This is an indicative estimate. Prices subject to final site survey. GST applicable as per category.';
  const f1w = fontReg.widthOfTextAtSize(f1, 7);
  t(f1, (W - f1w) / 2, 824, 7, fontReg, grey);
  const f2 = 'Tecbunny Solutions Pvt Ltd  |  GSTIN: 30AAMCT16886IZO  |  www.tecbunny.com';
  const f2w = fontReg.widthOfTextAtSize(f2, 7.5);
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
