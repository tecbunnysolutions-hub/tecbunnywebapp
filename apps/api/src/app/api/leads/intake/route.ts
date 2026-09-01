import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { LeadEngineService, logger } from '@tecbunny/core';
import { createSupabaseServiceClient } from '@tecbunny/core/server';

const intakeSchema = z.object({
  first_name: z.string().trim().min(1).max(120).optional(),
  last_name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(160).optional(),
  phone: z.string().trim().max(32).optional(),
  company_name: z.string().trim().max(200).optional(),
  source_name: z.string().trim().max(120).optional(),
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
  try {
    const body = await request.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      }, { status: 400 });
    }

    const data = parsed.data;
    if (!data.email && !data.phone) {
      return NextResponse.json({
        success: false,
        error: 'At least one contact identifier is required (email or phone).',
      }, { status: 400 });
    }

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

    return NextResponse.json({
      success: true,
      leadId: result.lead?.id,
      messageId: result.messageId,
      isNew: result.isNew,
    }, { status: 201 });
  } catch (error) {
    logger.error('lead_intake_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}
