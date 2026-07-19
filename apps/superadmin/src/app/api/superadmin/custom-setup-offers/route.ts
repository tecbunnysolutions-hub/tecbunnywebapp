import { NextRequest, NextResponse } from 'next/server';

import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { logger } from '@tecbunny/core/logger';
import { createServiceClient } from '@tecbunny/database/admin';
import { requireSuperadminApi } from '@/lib/superadmin-api';

function normalizePayload(body: any) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const startDate = typeof body.start_date === 'string' ? body.start_date : '';
  const endDate = typeof body.end_date === 'string' ? body.end_date : '';

  if (!title || !startDate || !endDate) {
    return { error: 'Title, start date, and end date are required' } as const;
  }

  return {
    data: {
      title,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      offer_type: body.offer_type || 'PERCENTAGE_DISCOUNT',
      offer_value: body.offer_value == null ? null : String(body.offer_value),
      start_date: startDate,
      end_date: endDate,
      is_active: body.is_active !== false,
      updated_at: new Date().toISOString(),
    },
  } as const;
}

export async function GET() {
  const auth = await requireSuperadminApi('superadmin_custom_setup_offers');
  if (!auth.authorized) return auth.response;

  try {
    const { data, error } = await createServiceClient()
      .from('custom_setup_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ offers: data ?? [] });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.list_failed', { error });
    return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_custom_setup_offers');
  if (!auth.authorized) return auth.response;

  try {
    const parsed = normalizePayload(await request.json().catch(() => ({})));
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { data, error } = await withAuditEvent({
      application: 'superadmin',
      module: 'custom_setup_offers',
      screen: '/api/superadmin/custom-setup-offers',
      action: 'custom_setup_offer_create',
      description: `Created custom setup offer ${parsed.data.title}`,
      entityType: 'custom_setup_offer',
      entityId: parsed.data.title,
      oldValue: null,
      newValue: parsed.data,
      reason: 'superadmin_custom_setup_offer_create',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/superadmin/custom-setup-offers',
      httpMethod: 'POST',
      databaseTable: 'custom_setup_offers',
      priority: 'high',
    }, async () => createServiceClient()
      .from('custom_setup_offers')
      .insert({ ...parsed.data, created_at: new Date().toISOString() })
      .select('*')
      .single());

    if (error) throw error;
    return NextResponse.json({ message: 'Offer created successfully', offer: data }, { status: 201 });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.create_failed', { error });
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_custom_setup_offers');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });

    const parsed = normalizePayload(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from('custom_setup_offers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

    const { data, error } = await withAuditEvent({
      application: 'superadmin',
      module: 'custom_setup_offers',
      screen: '/api/superadmin/custom-setup-offers',
      action: 'custom_setup_offer_update',
      description: `Updated custom setup offer ${parsed.data.title}`,
      entityType: 'custom_setup_offer',
      entityId: id,
      oldValue: existing,
      newValue: parsed.data,
      reason: 'superadmin_custom_setup_offer_update',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/superadmin/custom-setup-offers',
      httpMethod: 'PUT',
      databaseTable: 'custom_setup_offers',
      priority: 'high',
    }, async () => supabase
        .from('custom_setup_offers')
        .update(parsed.data)
        .eq('id', id)
        .select('*')
        .single());

    if (error) throw error;
    return NextResponse.json({ message: 'Offer updated successfully', offer: data });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.update_failed', { error });
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_custom_setup_offers');
  if (!auth.authorized) return auth.response;

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from('custom_setup_offers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

    const { error } = await withAuditEvent({
      application: 'superadmin',
      module: 'custom_setup_offers',
      screen: '/api/superadmin/custom-setup-offers',
      action: 'custom_setup_offer_delete',
      description: `Deleted custom setup offer ${existing.title}`,
      entityType: 'custom_setup_offer',
      entityId: id,
      oldValue: existing,
      newValue: null,
      reason: 'superadmin_custom_setup_offer_delete',
      context: { userId: auth.user?.id, userEmail: auth.user?.email, role: 'superadmin' },
      apiEndpoint: '/api/superadmin/custom-setup-offers',
      httpMethod: 'DELETE',
      databaseTable: 'custom_setup_offers',
      priority: 'high',
    }, async () => supabase
        .from('custom_setup_offers')
        .delete()
        .eq('id', id));

    if (error) throw error;
    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.delete_failed', { error });
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}