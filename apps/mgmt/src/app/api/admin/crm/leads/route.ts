import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { logger } from '@tecbunny/core/logger';
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

async function findExistingLead(supabase: any, email: string | null, phone: string | null) {
  if (email) {
    const { data, error } = await supabase
      .from('sls_leads')
      .select('id, metadata')
      .eq('email', email)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  if (phone) {
    const { data, error } = await supabase
      .from('sls_leads')
      .select('id, metadata')
      .eq('phone', phone)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
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
    const existingLead = await findExistingLead(supabase, email, phone);
    const now = new Date().toISOString();
    const status = input.mode === 'customer' ? 'CONVERTED' : 'NEW';
    const metadata = {
      ...(existingLead?.metadata && typeof existingLead.metadata === 'object' ? existingLead.metadata : {}),
      source_name: cleanOptional(input.sourceName) ?? 'Management CRM',
      contact_type: input.mode,
    };

    const payload = {
      first_name: input.firstName.trim(),
      last_name: cleanOptional(input.lastName),
      email,
      phone,
      company_name: cleanOptional(input.companyName),
      requirement: cleanOptional(input.requirement),
      status,
      lead_score: input.mode === 'customer' ? 80 : 20,
      heat_level: input.mode === 'customer' ? 'WARM' : 'COLD',
      metadata,
      updated_by: userId,
      updated_at: now,
    };

    if (existingLead) {
      const { data, error } = await supabase
        .from('sls_leads')
        .update(payload)
        .eq('id', existingLead.id)
        .select('id, first_name, last_name, phone, email, status, heat_level, lead_score, created_at, address')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, isNew: false, lead: data, correlationId });
    }

    const { data, error } = await supabase
      .from('sls_leads')
      .insert({
        ...payload,
        created_by: userId,
      })
      .select('id, first_name, last_name, phone, email, status, heat_level, lead_score, created_at, address')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, isNew: true, lead: data, correlationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create CRM contact';
    logger.error('mgmt.crm.leads.create_failed', { correlationId, error: message });
    return NextResponse.json({ error: message, correlationId }, { status: 500 });
  }
}