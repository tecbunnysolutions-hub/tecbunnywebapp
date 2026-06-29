import PDFDocument from 'pdfkit';
import fs from 'fs';

try {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('scratch/test-rupee.pdf'));
  doc.fontSize(12);
  doc.text('Testing Rupee Symbol: ₹ 100 or Rs. 100');
  doc.end();
  console.log("PDF generated successfully!");
} catch (err) {
  console.error("PDF generation failed:", err);
}
