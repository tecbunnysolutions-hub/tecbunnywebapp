import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

const consentSchema = z.object({
  phone: z.string().trim().min(6).max(32),
  optedIn: z.boolean(),
  source: z.string().trim().min(2).max(80).default('manual_admin'),
});

export async function GET(request: Request) {
  const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
  if (auth.error) return auth.error;

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

  const { data, error } = await builder;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ contacts: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
  if (auth.error) return auth.error;

  const parsed = consentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid consent payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { phone, optedIn, source } = parsed.data;
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, contact: data });
}