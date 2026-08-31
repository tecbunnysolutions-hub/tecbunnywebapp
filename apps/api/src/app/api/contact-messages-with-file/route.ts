import { createSupabaseServiceClient } from "@tecbunny/core/server";
import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase } from '@tecbunny/database/storage';
import { logger } from "@tecbunny/core";
import { scoreLeadPriority, type AssessmentData } from "@tecbunny/core/lead-scoring";
import { notifySalesAboutLead, type LeadNotificationPayload } from "@tecbunny/core/leads/notify-sales";

export const runtime = 'nodejs';

// Max file size: 10MB for assessment documents
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for assessment documents
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

async function hasValidFileSignature(file: File) {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  
  // PDF: %PDF (0x25504446)
  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
  
  // JPEG: FF D8 FF
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a;

  // WebP: RIFF ... WEBP
  const isWebp =
    head[0] === 0x52 && // 'R'
    head[1] === 0x49 && // 'I'
    head[2] === 0x46 && // 'F'
    head[3] === 0x46;   // 'F'

  return isPdf || isJpeg || isPng || isWebp;
}

/**
 * Extract assessment data from message body for lead scoring
 * Parse the formatted message to extract structured data
 */
function extractAssessmentDataFromMessage(message: string): Partial<AssessmentData> {
  const data: Partial<AssessmentData> = {};

  // Parse structured fields from formatted message
  const serviceMatch = message.match(/Service Requested:\s*(.+?)(?:\n|$)/);
  if (serviceMatch) data.service = serviceMatch[1].trim();

  const industryMatch = message.match(/Industry:\s*(.+?)(?:\n|$)/);
  if (industryMatch) data.industry = industryMatch[1].trim();

  const scaleMatch = message.match(/Property Scale:\s*(.+?)(?:\n|$)/);
  if (scaleMatch) data.scale = scaleMatch[1].trim();

  const timelineMatch = message.match(/Implementation Timeline:\s*(.+?)(?:\n|$)/);
  if (timelineMatch) data.timeline = timelineMatch[1].trim();

  const cityMatch = message.match(/Location \/ City:\s*(.+?)(?:\n|$)/);
  if (cityMatch) data.city = cityMatch[1].trim();

  const budgetMatch = message.match(/Estimated Budget:\s*(.+?)(?:\n|$)/);
  if (budgetMatch) data.budget = budgetMatch[1].trim();

  // Extract problem and notes sections
  const problemMatch = message.match(/Current Problem \/ Challenges:\n([\s\S]+?)(?:\n\nAdditional Notes|$)/);
  if (problemMatch) {
    const problemText = problemMatch[1].trim();
    if (problemText !== 'Not specified') {
      data.current_problem = problemText;
    }
  }

  const notesMatch = message.match(/Additional Notes \/ Scope:\n([\s\S]+?)$/);
  if (notesMatch) {
    const notesText = notesMatch[1].trim();
    if (notesText !== 'None') {
      data.additional_notes = notesText;
    }
  }

  return data;
}

interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  subject?: string | null;
  message: string;
  service_interest?: string | null;
  origin_path?: string | null;
  form_identifier?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  document_url?: string | null;
  document_filename?: string | null;
  document_mime_type?: string | null;
  document_size_bytes?: number | null;
  lead_score?: number;
  lead_priority?: string;
}

function classifyInquiry(input: {
  originPath?: string;
  formIdentifier?: string;
  subject?: string;
}) {
  const originPath = input.originPath?.split('?')[0]?.trim() || '';
  const formIdentifier = input.formIdentifier?.trim().toLowerCase() || '';
  const subject = input.subject?.trim().toLowerCase() || '';

  if (originPath === '/webdev' || formIdentifier === 'web_development_contact' || subject.includes('web development')) {
    return {
      category: 'Sales' as const,
      originKey: 'web_development',
      originPath: '/webdev',
    };
  }

  if (
    originPath === '/services/smart-infrastructure'
    || formIdentifier === 'smart_infrastructure_proposal'
  ) {
    return {
      category: 'Services' as const,
      originKey: 'smart_infrastructure',
      originPath: '/services/smart-infrastructure',
    };
  }

  if (formIdentifier === 'services_core_desk') {
    return {
      category: 'Services' as const,
      originKey: 'services_core_desk',
      originPath: originPath || '/services',
    };
  }

  if (formIdentifier === 'technology_assessment_funnel') {
    return {
      category: 'Sales' as const,
      originKey: 'technology_assessment',
      originPath: '/assessment',
    };
  }

  return {
    category: 'Sales' as const,
    originKey: 'general_contact',
    originPath: originPath || '/contact',
  };
}

export async function POST(request: NextRequest) {
  const correlationId = `contact-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Extract contact message fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string | null;
    const company_name = formData.get('company_name') as string | null;
    const subject = formData.get('subject') as string | null;
    const message = formData.get('message') as string;
    const service_interest = formData.get('service_interest') as string | null;
    const origin_path = formData.get('origin_path') as string | null;
    const form_identifier = formData.get('form_identifier') as string | null;
    const utm_source = formData.get('utm_source') as string | null;
    const utm_medium = formData.get('utm_medium') as string | null;
    const utm_campaign = formData.get('utm_campaign') as string | null;

    // Validate required fields
    if (!name || !email || !message) {
      logger.warn('contact_upload.missing_fields', { correlationId });
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }

    logger.info('contact_upload.request_received', {
      correlationId,
      hasFile: !!file,
      formIdentifier: form_identifier,
    });

    let documentUrl: string | undefined;
    let documentFilename: string | undefined;
    let documentMimeType: string | undefined;
    let documentSizeBytes: number | undefined;

    // Handle file upload if provided
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        logger.warn('contact_upload.file_too_large', {
          correlationId,
          size: file.size,
          maxSize: MAX_FILE_SIZE,
        });
        return NextResponse.json(
          { error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        logger.warn('contact_upload.invalid_mime', {
          correlationId,
          mime: file.type,
        });
        return NextResponse.json(
          { error: 'Unsupported file type. Allowed: PDF, PNG, JPG, WEBP' },
          { status: 400 }
        );
      }

      // Validate file signature
      if (!(await hasValidFileSignature(file))) {
        logger.warn('contact_upload.invalid_signature', { correlationId });
        return NextResponse.json(
          { error: 'Invalid file signature. Please upload a valid document' },
          { status: 400 }
        );
      }

      // Upload to Supabase Storage
      try {
        const result = await uploadToSupabase(file, 'contact-message-attachments');
        documentUrl = result.secure_url;
        documentFilename = file.name;
        documentMimeType = file.type;
        documentSizeBytes = file.size;

        logger.info('contact_upload.file_uploaded', {
          correlationId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          publicId: result.public_id,
        });
      } catch (uploadError: any) {
        logger.error('contact_upload.file_upload_failed', {
          correlationId,
          error: uploadError.message,
        });
        return NextResponse.json(
          { error: 'Failed to upload document' },
          { status: 500 }
        );
      }
    }

    // Insert contact message into database
    try {
      const supabase = createSupabaseServiceClient();
      const classification = classifyInquiry({
        originPath: origin_path || undefined,
        formIdentifier: form_identifier || undefined,
        subject: subject || undefined,
      });

      // Extract assessment data for lead scoring
      const assessmentData = extractAssessmentDataFromMessage(message) as AssessmentData;
      assessmentData.document_url = documentUrl;
      assessmentData.phone = phone || undefined;

      // Score the lead
      const leadScore = scoreLeadPriority(assessmentData);

      const payload: ContactMessagePayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        company_name: company_name?.trim() || null,
        service_interest: service_interest?.trim() || null,
        origin_path: classification.originPath,
        form_identifier: form_identifier?.trim().toLowerCase() || null,
        utm_source: utm_source?.trim() || null,
        utm_medium: utm_medium?.trim() || null,
        utm_campaign: utm_campaign?.trim() || null,
        document_url: documentUrl || null,
        document_filename: documentFilename || null,
        document_mime_type: documentMimeType || null,
        document_size_bytes: documentSizeBytes || null,
        lead_score: leadScore.totalScore,
        lead_priority: leadScore.priority,
      };

      const { data: result, error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          ...payload,
          status: 'New',
          inquiry_category: classification.category,
          origin_key: classification.originKey,
          last_activity_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (dbError) {
        logger.error('contact_upload.db_insert_failed', {
          correlationId,
          error: dbError.message,
        });
        return NextResponse.json(
          { error: 'Failed to save contact message' },
          { status: 500 }
        );
      }

      logger.info('contact_upload.success', {
        correlationId,
        messageId: result?.id,
        hasDocument: !!documentUrl,
        fileName: documentFilename,
        leadScore: leadScore.totalScore,
        leadPriority: leadScore.priority,
      });

      // Notify sales asynchronously (don't block response)
      if (form_identifier === 'technology_assessment_funnel') {
        const notificationPayload: LeadNotificationPayload = {
          leadId: result?.id || 'unknown',
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          company_name: company_name?.trim(),
          service: service_interest?.trim() || 'Not specified',
          industry: assessmentData.industry || 'Not specified',
          scale: assessmentData.scale || 'Not specified',
          city: assessmentData.city || 'Not specified',
          timeline: assessmentData.timeline || 'Not specified',
          budget: assessmentData.budget || undefined,
          currentProblem: assessmentData.current_problem || undefined,
          documentUrl,
          documentFilename,
          sourceContext: form_identifier,
        };

        // Fire and forget—don't wait for notification
        notifySalesAboutLead(notificationPayload, leadScore).catch((err: unknown) => {
          logger.error('contact_upload.notification_failed', {
            correlationId,
            messageId: result?.id,
            error: err instanceof Error ? err.message : String(err),
          });
        });
      }

      return NextResponse.json(
        {
          success: true,
          id: result?.id,
          message: 'Your assessment request has been received',
          documentUrl: documentUrl || null,
          leadScore: leadScore.totalScore,
          leadPriority: leadScore.priority,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      logger.error('contact_upload.unexpected_db_error', {
        correlationId,
        error: dbError.message,
      });
      return NextResponse.json(
        { error: 'Unexpected error saving message' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error('contact_upload.unhandled_error', {
      correlationId,
      error: error.message,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
