import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';

type LineItem = { description?: unknown; mrp?: unknown; sale?: unknown };
type EstimateBody = {
  systemLabel?: unknown;
  cameraCount?: unknown;
  breakdown?: unknown;
  items?: unknown;
  saleTotalOverall?: unknown;
  mrpTotalOverall?: unknown;
  discountAmount?: unknown;
  discountPercent?: unknown;
};

const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const text = (value: unknown, max = 160) => typeof value === 'string' ? value.replace(/[^\x20-\xFF]/g, '?').slice(0, max) : '';
const inr = (value: number) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`;

/** Creates a presentation-only estimate; commercial approval remains server-side. */
export async function POST(request: NextRequest) {
  let body: EstimateBody;
  try { body = await request.json() as EstimateBody; } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  const items = Array.isArray(body.items) ? body.items.slice(0, 30) as LineItem[] : [];
  const breakdown = Array.isArray(body.breakdown) ? body.breakdown.slice(0, 10).map((item) => text(item, 120)) : [];
  const systemLabel = text(body.systemLabel, 80);
  const cameraCount = Math.max(0, Math.floor(number(body.cameraCount)));
  const saleTotal = number(body.saleTotalOverall);
  const mrpTotal = number(body.mrpTotalOverall);
  const discount = number(body.discountAmount);
  const discountPercent = number(body.discountPercent);

  const document = await PDFDocument.create();
  const page = document.addPage([595, 842]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.059, 0.09, 0.165);
  const blue = rgb(0.231, 0.51, 0.98);
  const white = rgb(1, 1, 1);
  const slate = rgb(0.39, 0.455, 0.545);
  const draw = (value: string, x: number, y: number, size: number, strong = false, color = dark) => page.drawText(value, { x, y, size, font: strong ? bold : regular, color });

  page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: dark });
  draw('TECBUNNY', 48, 810, 18, true, white);
  draw('Solutions Pvt Ltd', 48, 794, 9, false, white);
  draw('PRICE ESTIMATE', 430, 810, 10, true, white);
  draw('CCTV Customised Setup', 430, 794, 8, false, white);
  draw(`Generated ${new Date().toLocaleDateString('en-IN')}`, 430, 780, 8, false, white);
  draw(`${systemLabel || 'Custom'} System | ${cameraCount} Camera${cameraCount === 1 ? '' : 's'}`, 48, 740, 13, true);
  draw('Prices are indicative and subject to final site-survey confirmation. Valid for 14 days.', 48, 723, 8, false, slate);
  let y = 696;
  if (breakdown.length) {
    draw('System Breakdown', 48, y, 9, true); y -= 14;
    for (const entry of breakdown) { draw(`- ${entry}`, 56, y, 8, false, slate); y -= 12; }
    y -= 8;
  }
  page.drawRectangle({ x: 48, y: y - 4, width: 499, height: 16, color: dark });
  draw('ITEM', 54, y + 1, 8, true, white); draw('MRP', 390, y + 1, 8, true, white); draw('SALE PRICE', 466, y + 1, 8, true, white); y -= 18;
  for (const item of items) {
    if (y < 110) break;
    draw(text(item.description, 52), 54, y, 8);
    draw(inr(number(item.mrp)), 390, y, 8, false, slate);
    draw(inr(number(item.sale)), 466, y, 8, true);
    y -= 16;
  }
  y -= 8;
  page.drawRectangle({ x: 48, y: y - 46, width: 499, height: 52, color: dark });
  draw(`MRP Total: ${inr(mrpTotal)}`, 60, y - 10, 9, false, white);
  draw(`Savings: ${inr(discount)} (${discountPercent.toFixed(1)}%)`, 60, y - 26, 9, false, white);
  draw(`SALE TOTAL: ${inr(saleTotal)}`, 330, y - 26, 12, true, blue);
  draw('This is an indicative estimate. GST is applicable as per category.', 145, 26, 7, false, slate);
  const bytes = await document.save();
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="tecbunny-cctv-estimate.pdf"', 'Content-Length': String(bytes.byteLength) } });
}
