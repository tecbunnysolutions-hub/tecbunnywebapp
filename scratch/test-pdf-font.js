import PDFDocument from 'pdfkit';
import fs from 'fs';

async function testPdfFont() {
  try {
    console.log("Fetching font...");
    const res = await fetch('https://fonts.gstatic.com/s/notosans/v35/o-0IIpQlx3QUlC5A4PNr6DRAW_0.ttf');
    const fontBuffer = Buffer.from(await res.arrayBuffer());

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('scratch/test-rupee-font.pdf'));
    
    // Register and use custom font
    doc.registerFont('NotoSans', fontBuffer);
    doc.font('NotoSans');

    doc.fontSize(12);
    doc.text('Testing Rupee Symbol in Custom Font: ₹ 100');
    doc.end();
    console.log("PDF generated successfully with custom font!");
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
}

testPdfFont();
