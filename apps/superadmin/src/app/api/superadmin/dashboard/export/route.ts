import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServiceClient } from '@tecbunny/database/admin';

import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

const EXPORTS = {
  audit: {
    table: 'enterprise_audit_logs',
    columns: ['created_at', 'user_email', 'application', 'module', 'screen', 'action', 'entity_type', 'entity_id', 'success', 'remarks'],
  },
  staff: {
    table: 'enterprise_staff_activity_logs',
    columns: ['created_at', 'user_email', 'role', 'module', 'action', 'description', 'success'],
  },
} as const;

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_dashboard_export');
  if (!auth.authorized) return auth.response;

  const type = request.nextUrl.searchParams.get('type');
  if (type !== 'audit' && type !== 'staff') {
    return NextResponse.json({ error: 'type must be "audit" or "staff"' }, { status: 400 });
  }

  const days = Math.min(90, Math.max(1, Number(request.nextUrl.searchParams.get('days') ?? 30) || 30));
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const { table, columns } = EXPORTS[type];

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select(columns.join(','))
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="superadmin-${type}-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
