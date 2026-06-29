import PDFDocument from 'pdfkit';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const formatCurrency = (val) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
  return formatted.replace(/₹/g, 'Rs.').replace(/INR/g, 'Rs.').trim();
};

const unescapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/₹/g, 'Rs.');
};

async function generateValidationPdf() {
  try {
    // Fetch the project from the DB
    const { data: project, error } = await supabase
      .from('upcoming_projects')
      .select('*')
      .eq('name', 'EduPortal and EduOS')
      .single();

    if (error || !project) {
      console.error("Error fetching project:", error);
      return;
    }

    console.log("Fetched project:", project.name);

    // Set page margins so PDFKit manages top/bottom flow automatically
    const doc = new PDFDocument({
      margins: {
        top: 75,
        bottom: 60,
        left: 50,
        right: 50
      },
      size: 'A4',
      bufferPages: true
    });

    const outputStream = fs.createWriteStream('scratch/rendered-output.pdf');
    doc.pipe(outputStream);

    // Calculations
    const target = Number(project.target_amount);
    const raised = Number(project.amount_raised);
    const remaining = Math.max(0, target - raised);

    // Start rendering elements in order
    // --- Document Title ---
    doc.fillColor('#0F172A')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(unescapeHtml(project.name).toUpperCase(), { width: doc.page.width - 100 });

    doc.moveDown(0.5);

    // --- Status ---
    doc.fillColor('#2563EB')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`Status: ${project.status}`);

    doc.moveDown(1.5);

    // --- Financial Table ---
    const tableTop = doc.y;
    doc.rect(50, tableTop, doc.page.width - 100, 70).fill('#F8FAFC');
    
    // Vertical accent bar
    doc.rect(50, tableTop, 4, 70).fill('#2563EB');

    // Target Amount
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('TARGET CAPITAL', 70, tableTop + 15);
    doc.fillColor('#0F172A').fontSize(16).font('Helvetica-Bold').text(formatCurrency(target), 70, tableTop + 30);

    // Amount Raised
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('AMOUNT SECURED', 230, tableTop + 15);
    doc.fillColor('#10B981').fontSize(16).font('Helvetica-Bold').text(formatCurrency(raised), 230, tableTop + 30);

    // Remaining Required
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('REMAINING REQUIRED', 390, tableTop + 15);
    doc.fillColor('#EF4444').fontSize(16).font('Helvetica-Bold').text(formatCurrency(remaining), 390, tableTop + 30);

    doc.y = tableTop + 70;
    doc.moveDown(2);

    // --- Section: Executive Summary ---
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }

    doc.fillColor('#0F172A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('1. Project Overview');
    doc.moveDown(0.6);

    doc.fillColor('#334155')
       .fontSize(11)
       .font('Helvetica')
       .text(unescapeHtml(project.explanation), { width: doc.page.width - 100, lineGap: 4 });

    doc.moveDown(2);

    // --- Section: Strategic Motive ---
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }

    doc.fillColor('#0F172A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('2. Strategic Motive');
    doc.moveDown(0.6);

    doc.fillColor('#334155')
       .fontSize(11)
       .font('Helvetica')
       .text(unescapeHtml(project.motive), { width: doc.page.width - 100, lineGap: 4 });

    doc.moveDown(2);

    // --- Section: Detailed Specifications (HTML parser) ---
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }

    doc.fillColor('#0F172A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('3. Detailed Specifications');
    doc.moveDown(0.8);

    // Simple HTML Rendering
    const htmlContent = project.detailed_information || '';
    const parts = htmlContent.split(/<\/p>|<\/h3>|<\/h4>|<\/li>|<br\s*\/?>/i);
    
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (doc.y > doc.page.height - 80) {
        doc.addPage();
      }

      if (part.includes('<h3') || part.includes('<h4')) {
        const text = part.replace(/<[^>]*>/g, '').trim();
        doc.fillColor('#2563EB')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(unescapeHtml(text));
        doc.moveDown(0.5);
      } else if (part.includes('<li')) {
        const text = part.replace(/<[^>]*>/g, '').trim();
        doc.fillColor('#1E293B')
           .fontSize(10.5)
           .font('Helvetica')
           .text(`•  ${unescapeHtml(text)}`, 65, undefined, { width: doc.page.width - 130 });
        doc.moveDown(0.4);
      } else {
        const text = part.replace(/<[^>]*>/g, '').trim();
        doc.fillColor('#334155')
           .fontSize(10.5)
           .font('Helvetica')
           .text(unescapeHtml(text), 50, undefined, { width: doc.page.width - 100, lineGap: 3 });
        doc.moveDown(0.6);
      }
    }

    // --- Global Header & Footer ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Temporarily set bottom margin to 0 to prevent footer text from triggering new page creation
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      // Draw header
      doc.fillColor('#0F172A')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('TECBUNNY SOLUTIONS PRIVATE LIMITED', 50, 40);
      
      doc.fillColor('#64748B')
         .fontSize(8)
         .font('Helvetica')
         .text('CONFIDENTIAL INVESTOR DOCUMENT', 400, 40, { align: 'right' });

      doc.strokeColor('#2563EB').lineWidth(1.5);
      doc.moveTo(50, 55).lineTo(doc.page.width - 50, 55).stroke();

      // Draw footer
      doc.strokeColor('#E2E8F0').lineWidth(0.5);
      doc.moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).stroke();

      doc.fillColor('#94A3B8')
         .fontSize(8)
         .font('Helvetica')
         .text('CONFIDENTIALITY NOTICE: This document is for qualified investors only and may contain proprietary info.', 50, doc.page.height - 35);

      doc.text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 35, { align: 'right' });

      // Restore margin
      doc.page.margins.bottom = oldBottomMargin;
    }

    doc.end();
    console.log("Successfully generated validation PDF!");
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
}

generateValidationPdf();
