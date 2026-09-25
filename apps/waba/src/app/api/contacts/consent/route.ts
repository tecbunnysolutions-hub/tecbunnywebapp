import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import { logger } from '@tecbunny/core/logger';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { resolveActorScope, getAccessibleConversationSenders, canAccessConversationSender } from '@/lib/authorization-scope';

export const dynamic = 'force-dynamic';

const consentSchema = z.object({
  phone: z.string().trim().min(6).max(32),
  optedIn: z.boolean(),
  source: z.string().trim().min(2).max(80).default('manual_admin'),
});

export async function GET(request: Request) {
  const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
  if (auth.error) return auth.error;
  const scope = await resolveActorScope(auth.session.user.id, auth.role);
  if (!scope) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const senders = await getAccessibleConversationSenders(scope);
  logger.info('waba_contacts_consent.audit.list_requested', { role: auth.role ?? null });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  let builder = supabase
    .from('waba_contact_consent')
    .select('phone, opted_in, source, last_opt_in_at, opted_out_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (query) {
    builder = builder.ilike('phone', `%${query}%`);
  }
  if (senders) {
    if (!senders.length) return NextResponse.json({ contacts: [] });
    builder = builder.in('phone', senders);
  }

  const { data, error } = await builder;
  if (error) {
    logger.error('waba_contacts_consent.audit.list_failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logger.info('waba_contacts_consent.audit.list_success', { count: (data ?? []).length, hasQuery: Boolean(query) });
  return NextResponse.json({ contacts: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
  if (auth.error) return auth.error;
  logger.info('waba_contacts_consent.audit.update_requested', { role: auth.role ?? null });

  const parsed = consentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid consent payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { phone, optedIn, source } = parsed.data;
  const scope = await resolveActorScope(auth.session.user.id, auth.role);
  if (!scope || !(await canAccessConversationSender(scope, phone))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { data, error } = await supabase
    .from('waba_contact_consent')
    .upsert({
      phone,
      opted_in: optedIn,
      source,
      last_opt_in_at: optedIn ? now : null,
      opted_out_at: optedIn ? null : now,
      updated_at: now,
    }, { onConflict: 'phone' })
    .select('phone, opted_in, source, last_opt_in_at, opted_out_at, updated_at')
    .single();

  if (error) {
    logger.error('waba_contacts_consent.audit.update_failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  logger.info('waba_contacts_consent.audit.update_success', { phone, optedIn });
  return NextResponse.json({ success: true, contact: data });
}
