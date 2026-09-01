import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { LeadEngineService, logger, validateLeadSource } from '@tecbunny/core';
import { createSupabaseServiceClient } from '@tecbunny/core/server';
import { rateLimit } from '@tecbunny/core/rate-limit';

// Security limits
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
const MAX_METADATA_KEYS = 20;
const MAX_METADATA_VALUE_SIZE = 10000; // 10KB per value

const RATE_LIMIT_CONFIG = {
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

// Whitelist of allowed metadata keys to prevent abuse
const ALLOWED_METADATA_KEYS = new Set([
  'ip_address',
  'referrer_url',
  'source_key',
  'request_host',
  'user_agent',
  'document_filename',
  'source_context',
  'custom_field_1',
  'custom_field_2',
  'custom_field_3',
]);

const intakeSchema = z.object({
  first_name: z.string().trim().min(1).max(120).optional(),
  last_name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(160).optional(),
  phone: z.string().trim().max(32).optional(),
  company_name: z.string().trim().max(200).optional(),
  source_name: z.string().trim().max(120).optional().refine(
    (val) => !val || validateLeadSource(val) !== null,
    'Invalid lead source'
  ),
  form_identifier: z.string().trim().max(120).optional(),
  origin_path: z.string().trim().max(240).optional(),
  service_interest: z.string().trim().max(200).optional(),
  requirement: z.string().trim().max(5000).optional(),
  message: z.string().trim().max(5000).optional(),
  tracking_session_id: z.string().trim().max(200).optional(),
  utm_source: z.string().trim().max(160).optional(),
  utm_medium: z.string().trim().max(160).optional(),
  utm_campaign: z.string().trim().max(160).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const correlationId = `lead-intake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Rate limiting
    const submissionIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!rateLimit(submissionIp, 'lead_intake_post', RATE_LIMIT_CONFIG)) {
      logger.warn('lead_intake.rate_limit_exceeded', { correlationId, ip: submissionIp });
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check payload size before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      logger.warn('lead_intake.payload_too_large', { correlationId, size: contentLength });
      return NextResponse.json(
        { success: false, error: 'Payload exceeds maximum size (1MB)' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('lead_intake.validation_failed', { correlationId, errors: parsed.error.flatten() });
      return NextResponse.json({
        success: false,
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      }, { status: 400 });
    }

    const data = parsed.data;
    if (!data.email && !data.phone) {
      logger.warn('lead_intake.missing_contact', { correlationId });
      return NextResponse.json({
        success: false,
        error: 'At least one contact identifier is required (email or phone).',
      }, { status: 400 });
    }

    // Validate metadata if present
    if (data.metadata) {
      const metadataKeys = Object.keys(data.metadata);
      
      // Check key count
      if (metadataKeys.length > MAX_METADATA_KEYS) {
        logger.warn('lead_intake.metadata_keys_exceeded', { correlationId, count: metadataKeys.length });
        return NextResponse.json(
          { success: false, error: `Metadata exceeds maximum keys (${MAX_METADATA_KEYS})` },
          { status: 400 }
        );
      }

      // Validate each key and value
      for (const [key, value] of Object.entries(data.metadata)) {
        // Only allow whitelisted keys
        if (!ALLOWED_METADATA_KEYS.has(key)) {
          logger.warn('lead_intake.metadata_key_not_whitelisted', { correlationId, key });
          return NextResponse.json(
            { success: false, error: `Metadata key "${key}" is not allowed` },
            { status: 400 }
          );
        }

        // Check value size
        const valueSize = JSON.stringify(value).length;
        if (valueSize > MAX_METADATA_VALUE_SIZE) {
          logger.warn('lead_intake.metadata_value_too_large', { correlationId, key, size: valueSize });
          return NextResponse.json(
            { success: false, error: `Metadata value for "${key}" exceeds size limit` },
            { status: 400 }
          );
        }
      }
    }

    logger.info('lead_intake.request_valid', { correlationId, email: data.email, source: data.source_name });

    const supabase = createSupabaseServiceClient();
    const result = await LeadEngineService.createLeadFromIntake(supabase, {
      first_name: data.first_name || 'Visitor',
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      company_name: data.company_name,
      source_name: data.source_name || data.form_identifier || data.origin_path || 'website',
      form_identifier: data.form_identifier,
      origin_path: data.origin_path,
      service_interest: data.service_interest,
      requirement: data.requirement || data.message,
      message: data.message || data.requirement,
      tracking_session_id: data.tracking_session_id,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      metadata: data.metadata || {},
    });

    logger.info('lead_intake.success', {
      correlationId,
      leadId: result.lead?.id,
      messageId: result.messageId,
      isNew: result.isNew,
      ip: submissionIp,
    });

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      messageId: result.messageId,
      isNew: result.isNew,
      correlationId,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create lead';
    logger.error('lead_intake.error', {
      correlationId,
      error: message,
    });
    return NextResponse.json({ success: false, error: message, correlationId }, { status: 500 });
  }
}
