import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LineItem { label: string; price: number; }
interface PDFBody {
  quoteRef: string;
  customerName: string;
  site: string;
  installType: string;
  validity: number;
  notes: string;
  rows: { item: string; unitPrice: string; qty: string; amount: string }[];
  addons: LineItem[];
  total: number;
}

function rm(n: number) {
  return `INR ${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

export async function POST(req: NextRequest) {
  let body: PDFBody;
  try {
    body = await req.json() as PDFBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { quoteRef, customerName, site, installType, validity, notes, rows, addons, total } = body;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { height } = page.getSize();
  const W = 595;
  const ML = 50; // margin left
  const MR = 50; // margin right
  const CW = W - ML - MR; // content width = 495

  const fontReg  = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const dark   = rgb(0.059, 0.090, 0.165);  // #0f172a
  const mid    = rgb(0.118, 0.161, 0.231);  // #1e293b
  const accent = rgb(0.231, 0.510, 0.980);  // #3b82f6
  const accentL = rgb(0.376, 0.647, 0.980); // #60a5fa
  const white  = rgb(1, 1, 1);
  const grey   = rgb(0.580, 0.639, 0.722);  // #94a3b8
  const light  = rgb(0.886, 0.835, 0.902);  // #e2e8f0 approx
  const slate  = rgb(0.392, 0.455, 0.545);  // #64748b

  // helper: draw text left-aligned
  const text = (str: string, x: number, y: number, size: number, font = fontReg, color = light) => {
    page.drawText(String(str).replaceAll('₹', 'INR '), { x, y: height - y, size, font, color });
  };
  // helper: draw text right-aligned
  const textR = (str: string, x: number, y: number, size: number, font = fontReg, color = light) => {
    const printable = String(str).replaceAll('₹', 'INR ');
    const w = font.widthOfTextAtSize(printable, size);
    page.drawText(printable, { x: x - w, y: height - y, size, font, color });
  };
  // helper: filled rect (y from top)
  const rect = (x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) => {
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color });
  };

  // ── Header band ──────────────────────────────────────────────
  rect(0, 0, W, 60, dark);
  text('CCTV Security System Quotation', ML, 22, 16, fontBold, white);
  text('Powered by Tecbunny', ML, 40, 9, fontReg, grey);
  textR(`Ref: ${quoteRef}`, W - MR, 40, 9, fontReg, grey);
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  textR(`Date: ${today}   Valid: ${validity} days`, W - MR, 52, 9, fontReg, grey);

  // ── Customer / site block ────────────────────────────────────
  let y = 76;
  rect(ML, y, CW, 36, mid);
  text('PREPARED FOR', ML + 8, y + 10, 7.5, fontBold, accentL);
  text(customerName || '—', ML + 8, y + 24, 10, fontReg, white);
  text('INSTALLATION SITE', ML + CW / 2 + 8, y + 10, 7.5, fontBold, accentL);
  text(site || '—', ML + CW / 2 + 8, y + 24, 10, fontReg, white);
  text(`Installation Type: ${installType}`, ML + 8, y + 34, 8, fontReg, grey);
  y += 48;

  // ── Section helper ────────────────────────────────────────────
  const section = (title: string) => {
    rect(ML, y, 4, 10, accent);
    text(title, ML + 10, y + 8, 9, fontBold, accentL);
    y += 17;
  };

  // ── Breakdown table ───────────────────────────────────────────
  section('SYSTEM BREAKDOWN');
  rect(ML, y, CW, 12, mid);
  text('ITEM', ML + 4, y + 9, 7.5, fontBold, grey);
  text('UNIT PRICE', ML + 240, y + 9, 7.5, fontBold, grey);
  text('QTY', ML + 340, y + 9, 7.5, fontBold, grey);
  textR('AMOUNT', ML + CW - 4, y + 9, 7.5, fontBold, grey);
  y += 12;

  rows.forEach((row, i) => {
    if (i % 2 === 0) rect(ML, y, CW, 14, dark);
    text(row.item,      ML + 4,       y + 10, 9, fontReg, light);
    text(row.unitPrice, ML + 240,     y + 10, 8, fontReg, slate);
    text(row.qty,       ML + 340,     y + 10, 8, fontReg, slate);
    textR(row.amount,   ML + CW - 4,  y + 10, 9, fontReg, light);
    y += 14;
  });
  y += 6;

  // ── Add-ons ───────────────────────────────────────────────────
  if (addons.length > 0) {
    section('ADD-ONS & EXTRAS');
    addons.forEach((addon, i) => {
      if (i % 2 === 0) rect(ML, y, CW, 14, dark);
      text(addon.label, ML + 4, y + 10, 9, fontReg, light);
      textR(addon.price === 0 ? 'Included' : rm(addon.price), ML + CW - 4, y + 10, 9, fontReg, light);
      y += 14;
    });
    y += 6;
  }

  // ── Total ─────────────────────────────────────────────────────
  rect(ML, y, CW, 22, mid);
  // accent left border
  rect(ML, y, 4, 22, accent);
  text('ESTIMATED TOTAL', ML + 10, y + 15, 11, fontBold, white);
  textR(rm(total), ML + CW - 8, y + 15.5, 13, fontBold, accentL);
  y += 30;

  // ── Notes ─────────────────────────────────────────────────────
  if (notes.trim()) {
    section('NOTES');
    const words = notes.trim().split(' ');
    let line = '';
    const maxW = CW - 8;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (fontReg.widthOfTextAtSize(test, 9) > maxW) {
        text(line, ML + 4, y + 9, 9, fontReg, light);
        y += 13;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) { text(line, ML + 4, y + 9, 9, fontReg, light); y += 13; }
    y += 4;
  }

  // ── Footer band ────────────────────────────────────────────────
  rect(0, 812, W, 30, dark);
  const footerLine1 = `This is an estimated quotation valid for ${validity} days. Prices subject to site survey confirmation.`;
  const fl1w = fontReg.widthOfTextAtSize(footerLine1, 7.5);
  text(footerLine1, (W - fl1w) / 2, 824, 7.5, fontReg, grey);
  const footerLine2 = 'Tecbunny Sdn Bhd  |  www.tecbunny.com';
  const fl2w = fontReg.widthOfTextAtSize(footerLine2, 7.5);
  text(footerLine2, (W - fl2w) / 2, 836, 7.5, fontReg, grey);

  const bytes = await doc.save();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="CCTV-Quote-${quoteRef}.pdf"`,
      'Content-Length': bytes.byteLength.toString(),
    },
  });
}
