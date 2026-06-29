import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { createSupabaseClient as createPublicSupabaseClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';
import PDFDocument from 'pdfkit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const supabase = isSupabaseServiceConfigured
      ? createServiceClient()
      : createPublicSupabaseClient();

    const { data: project, error } = await supabase
      .from('upcoming_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      logger.error('upcoming_project_pdf_fetch_failed', { error: error?.message, id });
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculations
    const target = Number(project.target_amount);
    const raised = Number(project.amount_raised);
    const remaining = Math.max(0, target - raised);

    // Format currency helpers
    const formatCurrency = (val: number) => {
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
      return formatted.replace(/₹/g, 'Rs.').replace(/INR/g, 'Rs.').trim();
    };

    const unescapeHtml = (str: string): string => {
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

    // PDF Generation
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // --- Header (Sitewide Standard) ---
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

        // --- Document Title ---
        doc.fillColor('#0F172A')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text(unescapeHtml(project.name).toUpperCase(), 50, 80);

        doc.fillColor('#2563EB')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`Status: ${project.status}`, 50, 110);

        // --- Financial Table ---
        const tableTop = 135;
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

        // --- Section: Executive Summary ---
        doc.fillColor('#0F172A')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('1. Project Overview', 50, 230);

        doc.fillColor('#334155')
           .fontSize(11)
           .font('Helvetica')
           .text(unescapeHtml(project.explanation), 50, 250, { width: doc.page.width - 100, lineGap: 4 });

        // --- Section: Strategic Motive ---
        doc.fillColor('#0F172A')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('2. Strategic Motive', 50, 320);

        doc.fillColor('#334155')
           .fontSize(11)
           .font('Helvetica')
           .text(unescapeHtml(project.motive), 50, 340, { width: doc.page.width - 100, lineGap: 4 });

        // --- Section: Detailed Specifications (HTML parser) ---
        doc.fillColor('#0F172A')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('3. Detailed Specifications', 50, 420);

        // Simple HTML Rendering
        const htmlContent = project.detailed_information || '';
        let currentY = 440;

        // Split HTML text by paragraph, list item, or headings tags
        const parts = htmlContent.split(/<\/p>|<\/h3>|<\/h4>|<\/li>|<br\s*\/?>/i);
        
        for (let part of parts) {
          part = part.trim();
          if (!part) continue;

          // Check overflow and add page if necessary
          if (currentY > doc.page.height - 80) {
            doc.addPage();
            currentY = 60; // reset to top margin
          }

          if (part.includes('<h3') || part.includes('<h4')) {
            const text = part.replace(/<[^>]*>/g, '').trim();
            doc.fillColor('#2563EB')
               .fontSize(12)
               .font('Helvetica-Bold')
               .text(unescapeHtml(text), 50, currentY);
            currentY += 22;
          } else if (part.includes('<li')) {
            const text = part.replace(/<[^>]*>/g, '').trim();
            doc.fillColor('#1E293B')
               .fontSize(10.5)
               .font('Helvetica')
               .text(`•  ${unescapeHtml(text)}`, 65, currentY, { width: doc.page.width - 130 });
            currentY += doc.heightOfString(`•  ${unescapeHtml(text)}`, { width: doc.page.width - 130 }) + 8;
          } else {
            const text = part.replace(/<[^>]*>/g, '').trim();
            doc.fillColor('#334155')
               .fontSize(10.5)
               .font('Helvetica')
               .text(unescapeHtml(text), 50, currentY, { width: doc.page.width - 100, lineGap: 3 });
            currentY += doc.heightOfString(unescapeHtml(text), { width: doc.page.width - 100, lineGap: 3 }) + 12;
          }
        }

        // --- Global Footer (confidential notice and page numbers) ---
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.strokeColor('#E2E8F0').lineWidth(0.5);
          doc.moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).stroke();

          doc.fillColor('#94A3B8')
             .fontSize(8)
             .font('Helvetica')
             .text('CONFIDENTIALITY NOTICE: This document is for qualified investors only and may contain proprietary info.', 50, doc.page.height - 35);

          doc.text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 35, { align: 'right' });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    const safeName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Executive_Summary_${safeName}.pdf"`
      }
    });
  } catch (error) {
    logger.error('upcoming_project_pdf_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
