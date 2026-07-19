import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServiceClient } from '@tecbunny/database/admin';

import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['acknowledged', 'resolved', 'dismissed'] as const;

export async function GET() {
  const auth = await requireSuperadminApi('superadmin_dashboard_alerts');
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('enterprise_alert_acknowledgements')
    .select('id,alert_key,module,severity,status,acknowledged_by,note,created_at')
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
  const module = typeof body.module === 'string' ? body.module.trim() : '';
  const severity = typeof body.severity === 'string' ? body.severity.trim() : 'medium';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  const status = VALID_STATUSES.includes(body.status) ? body.status : 'acknowledged';

  if (!alertKey || !module) {
    return NextResponse.json({ error: 'alertKey and module are required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('enterprise_alert_acknowledgements')
    .insert({
      alert_key: alertKey,
      module,
      severity,
      status,
      note,
      acknowledged_by: auth.user?.email ?? auth.user?.id ?? 'superadmin-session',
    })
    .select('id,alert_key,status,acknowledged_by,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ acknowledgement: data });
}
