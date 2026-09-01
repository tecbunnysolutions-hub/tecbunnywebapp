import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger, LeadEngineService } from '@tecbunny/core';
import { isAtLeast, type UserRole } from '@tecbunny/core/roles';
import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createLeadSchema = z.object({
  mode: z.enum(['lead', 'customer']).default('lead'),
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  companyName: z.string().trim().max(160).optional().or(z.literal('')),
  requirement: z.string().trim().max(1000).optional().or(z.literal('')),
  sourceName: z.string().trim().max(120).optional().or(z.literal('')),
});

function canWriteCrm(role: UserRole | null | undefined) {
  if (!role) return false;
  return isAtLeast(role, 'admin')
    || isAtLeast(role, 'sales_manager')
    || isAtLeast(role, 'service_manager')
    || isAtLeast(role, 'marketing_manager')
    || role === 'sales_executive'
    || role === 'sales'
    || role === 'store_executive'
    || role === 'sales-staff'
    || role === 'sales_agent'
    || role === 'sales-external'
    || role === 'marketing_executive';
}

function getUuidUserId(userId: string | undefined) {
  return userId && UUID_PATTERN.test(userId) ? userId : null;
}

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    logger.info('admin_crm_leads.audit.requested', { correlationId });
    const { supabase: authClient, session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', correlationId }, { status: 401 });
    }
    if (!canWriteCrm(role as UserRole | null)) {
      return NextResponse.json({ error: 'Forbidden', correlationId }, { status: 403 });
    }

    const validation = createLeadSchema.safeParse(await request.json().catch(() => ({})));
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid lead payload', details: validation.error.flatten(), correlationId }, { status: 400 });
    }

    const input = validation.data;
    const email = cleanOptional(input.email)?.toLowerCase() ?? null;
    const phone = cleanOptional(input.phone);
    if (!email && !phone) {
      return NextResponse.json({ error: 'Provide at least one contact method', correlationId }, { status: 400 });
    }

    const supabase = isSupabaseServiceConfigured ? createServiceClient() : authClient ?? await createClient();
    const userId = getUuidUserId(session.user.id);

    // Route through canonical LeadEngineService with admin options
    try {
      const result = await LeadEngineService.createAdminLeadFromCRM(
        supabase,
        {
          first_name: input.firstName.trim(),
          last_name: input.lastName,
          email: email || undefined,
          phone: phone || undefined,
          company_name: input.companyName,
          requirement: input.requirement,
          source_name: input.sourceName || 'Management CRM',
        },
        {
          mode: input.mode,
          created_by: userId,
          contact_type: input.mode,
        },
      );

      logger.info('admin_crm_leads.audit.success', { correlationId, isNew: result.isNew, leadId: result.lead.id });
      return NextResponse.json({
        success: true,
        isNew: result.isNew,
        lead: {
          id: result.lead.id,
          first_name: result.lead.first_name,
          last_name: result.lead.last_name,
          phone: result.lead.phone,
          email: result.lead.email,
          status: result.lead.status,
          heat_level: result.lead.heat_level,
          lead_score: result.lead.lead_score,
          created_at: result.lead.created_at,
          address: result.lead.metadata?.address || null,
        },
        correlationId,
      });
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Failed to create CRM contact via canonical service';
      logger.error('admin_crm_leads.audit.service_failed', { correlationId, error: message });
      throw serviceError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create CRM contact';
    logger.error('admin_crm_leads.audit.failed', { correlationId, error: message });
    logger.error('mgmt.crm.leads.create_failed', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}