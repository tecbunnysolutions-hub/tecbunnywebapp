import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServiceClient } from '@tecbunny/database/admin';

import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['acknowledged', 'resolved', 'dismissed', 'assigned'] as const;

export async function GET() {
  const auth = await requireSuperadminApi('superadmin_dashboard_alerts');
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('enterprise_alert_acknowledgements')
    .select('id,alert_key,module,severity,status,acknowledged_by,assigned_to,assigned_at,note,created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ acknowledgements: data ?? [] }, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_dashboard_alerts');
  if (!auth.authorized) return auth.response;

  const body = await request.json().catch(() => ({}));
  const alertKey = typeof body.alertKey === 'string' ? body.alertKey.trim() : '';
  const moduleName = typeof body.module === 'string' ? body.module.trim() : '';
  const severity = typeof body.severity === 'string' ? body.severity.trim() : 'medium';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  const status = VALID_STATUSES.includes(body.status) ? body.status : 'acknowledged';
  const assignedTo = typeof body.assignedTo === 'string' ? body.assignedTo.trim().slice(0, 200) : '';

  if (!alertKey || !moduleName) {
    return NextResponse.json({ error: 'alertKey and moduleName are required' }, { status: 400 });
  }

  if (status === 'assigned' && !assignedTo) {
    return NextResponse.json({ error: 'assignedTo is required when status is "assigned"' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('enterprise_alert_acknowledgements')
    .insert({
      alert_key: alertKey,
      module: moduleName,
      severity,
      status,
      note,
      acknowledged_by: auth.user?.email ?? auth.user?.id ?? 'superadmin-session',
      assigned_to: assignedTo || null,
      assigned_at: assignedTo ? new Date().toISOString() : null,
    })
    .select('id,alert_key,status,acknowledged_by,assigned_to,assigned_at,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ acknowledgement: data });
}
