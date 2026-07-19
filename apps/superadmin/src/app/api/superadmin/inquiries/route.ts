import { NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';
import { isSuperadmin, isSuperadminSession } from '@tecbunny/core/permissions';
import { createServiceClient } from '@tecbunny/database/admin';
import { createSupabaseClient } from '@tecbunny/database/server';

async function checkAuth() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(await isSuperadminSession() || await isSuperadmin(user));
  } catch (error) {
    logger.warn('superadmin_inquiries.auth_failed', { error });
    return false;
  }
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const supabase = createServiceClient();
    const [{ data: inquiries, error: inquiryError }, { data: staff, error: staffError }] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('id,name,full_name,email,mobile,role').in('role', ['sales_manager', 'sales_executive', 'store_executive', 'sales_agent', 'service_manager']),
    ]);

    if (inquiryError) throw inquiryError;
    if (staffError) throw staffError;

    return NextResponse.json({ inquiries: inquiries ?? [], staff: staff ?? [] });
  } catch (error) {
    logger.error('superadmin_inquiries.list_failed', { error });
    return NextResponse.json({ error: 'Failed to load inquiry pipeline' }, { status: 500 });
  }
}