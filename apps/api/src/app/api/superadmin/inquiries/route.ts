import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSuperadminContext, AdminAuthError } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core/logger";
import type { ContactMessage } from "@tecbunny/core/types";

const filtersSchema = z.object({
  category: z.enum(['Sales', 'Services']).optional(),
  status: z.enum(['New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected']).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(500),
});

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireSuperadminContext();
    const parsed = filtersSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid inquiry filters' }, { status: 400 });
    }

    let inquiryQuery = serviceSupabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parsed.data.limit);

    if (parsed.data.category) inquiryQuery = inquiryQuery.eq('inquiry_category', parsed.data.category);
    if (parsed.data.status) inquiryQuery = inquiryQuery.eq('status', parsed.data.status);

    const [{ data: inquiries, error: inquiryError }, { data: staff, error: staffError }] = await Promise.all([
      inquiryQuery,
      serviceSupabase
        .from('profiles')
        .select('id, name, full_name, email, mobile, role, is_active')
        .in('role', ['sales_manager', 'sales_executive', 'store_executive', 'sales_agent', 'service_manager'])
        .eq('is_active', true)
        .order('name'),
    ]);

    if (inquiryError) throw inquiryError;
    if (staffError) throw staffError;

    return NextResponse.json({
      inquiries: (inquiries || []) as ContactMessage[],
      staff: staff || [],
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('superadmin_inquiries_fetch_failed', { error });
    return NextResponse.json({ error: 'Failed to load inquiry pipelines' }, { status: 500 });
  }
}
