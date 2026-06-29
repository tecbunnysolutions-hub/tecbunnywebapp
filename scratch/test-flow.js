import PDFDocument from 'pdfkit';
import fs from 'fs';

async function testPdfFlow() {
  try {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(fs.createWriteStream('scratch/test-flow.pdf'));
    
    // Page Title (large text that will wrap)
    doc.fontSize(24).font('Helvetica-Bold')
       .text('GOA WORKFORCE LOCALIZATION & PUBLIC ITES INFRASTRUCTURE OPTIMIZATION', { width: doc.page.width - 100 });
    
    console.log("After Title doc.y:", doc.y);
    doc.moveDown(0.5);

    // Status
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#2563EB')
       .text('Status: Pipeline');
    console.log("After Status doc.y:", doc.y);
    doc.moveDown(1.5);

    // Explanation
    doc.fontSize(11).font('Helvetica').fillColor('#334155')
       .text('Paragraph 1: This is some long overview explanation text.\n\nParagraph 2: This is the second paragraph of the explanation that should not overlap with the title or the status or anything else.', { width: doc.page.width - 100, lineGap: 4 });
    console.log("After Explanation doc.y:", doc.y);

    doc.end();
    console.log("PDF Flow test successful!");
  } catch (err) {
    console.error("PDF Flow test failed:", err);
  }
}

testPdfFlow();
