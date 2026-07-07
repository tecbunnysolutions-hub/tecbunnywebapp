import { createClient as createServerClient } from "@tecbunny/core/supabase/server";

import { createSupabaseServiceClient, isSupabaseServiceConfigured } from "@tecbunny/core/server";;
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { rateLimit } from "@tecbunny/core/rate-limit";
import { logger } from "@tecbunny/core";
import { verifySuperadminSessionToken } from "@tecbunny/core/server";
import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";
import type { ContactMessage, ContactMessageStatus } from "@tecbunny/core/types";

const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

const createMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().min(5).max(160),
  phone: z.string().min(6).max(32).optional().or(z.literal('').transform(() => undefined)),
  subject: z.string().min(2).max(160).optional().or(z.literal('').transform(() => undefined)),
  message: z.string().min(10).max(5000),
  company_name: z.string().max(160).optional().or(z.literal('').transform(() => undefined)),
  origin_path: z.string().max(240).optional(),
  form_identifier: z.string().max(100).optional(),
  utm_source: z.string().max(160).optional(),
  utm_medium: z.string().max(160).optional(),
  utm_campaign: z.string().max(160).optional(),
});

const statusFilterSchema = z.object({
  status: z
    .union([
      z.enum(['New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected']),
      z.literal('all'),
      z.literal('ALL'),
    ])
    .optional()
    .transform(value => {
      if (!value) return undefined;
      return value.toLowerCase() === 'all' ? undefined : value;
    }),
  limit: z
    .string()
    .transform(value => Number.parseInt(value, 10))
    .pipe(z.number().min(1).max(200))
    .optional(),
});

function isMissingRelationError(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null | undefined;
  return candidate?.code === '42P01' ||
    candidate?.code === 'PGRST205' ||
    candidate?.message?.toLowerCase().includes('contact_messages') === true;
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

  return {
    category: 'Sales' as const,
    originKey: 'general_contact',
    originPath: originPath || '/contact',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check superadmin session cookie first to block contact messages submissions
    const superadminCookie = request.cookies.get('superadmin-session')?.value;
    if (await verifySuperadminSessionToken(superadminCookie)) {
      return NextResponse.json({
        error: 'Forbidden - System Configuration Accounts Cannot Submit Contact Messages.'
      }, { status: 403 });
    }

    const submissionIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!rateLimit(submissionIp, 'contact_messages_post', CONTACT_RATE_LIMIT)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const serviceSupabase = isSupabaseServiceConfigured ? createSupabaseServiceClient() : await createServerClient();
    const referrerUrl = request.headers.get('referer');
    const classification = classifyInquiry({
      originPath: parsed.data.origin_path,
      formIdentifier: parsed.data.form_identifier,
      subject: parsed.data.subject,
    });
    const payload = {
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone?.trim() || null,
      subject: parsed.data.subject?.trim() || null,
      message: parsed.data.message.trim(),
      status: 'New' as ContactMessageStatus,
      ip_address: submissionIp === 'anonymous' ? null : submissionIp,
      company_name: parsed.data.company_name?.trim() || null,
      inquiry_category: classification.category,
      origin_key: classification.originKey,
      origin_path: classification.originPath,
      form_identifier: parsed.data.form_identifier?.trim().toLowerCase() || null,
      referrer_url: referrerUrl,
      utm_source: parsed.data.utm_source?.trim() || null,
      utm_medium: parsed.data.utm_medium?.trim() || null,
      utm_campaign: parsed.data.utm_campaign?.trim() || null,
      origin_metadata: {
        request_host: request.headers.get('host'),
        user_agent: request.headers.get('user-agent'),
      },
      last_activity_at: new Date().toISOString(),
    };

    const { data, error } = await serviceSupabase
      .from('contact_messages')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      logger.error('contact_message_insert_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
    }

    logger.info('contact_message_created', { messageId: data?.id, ip: submissionIp });

    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (error) {
    logger.error('contact_message_post_unexpected', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsedFilters = statusFilterSchema.safeParse(params);

    if (!parsedFilters.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    let query = serviceSupabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (parsedFilters.data.status) {
      query = query.eq('status', parsedFilters.data.status as ContactMessageStatus);
    }

    if (parsedFilters.data.limit) {
      query = query.limit(parsedFilters.data.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingRelationError(error)) {
        logger.warn('contact_message_table_missing');
        return NextResponse.json({ data: [] });
      }
      logger.error('contact_message_list_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
    }

    return NextResponse.json({ data: (data ?? []) as ContactMessage[] });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('contact_message_get_unexpected', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
