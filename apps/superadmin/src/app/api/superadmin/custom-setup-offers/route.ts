import { NextRequest, NextResponse } from 'next/server';

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
    logger.warn('superadmin_custom_setup_offers.auth_failed', { error });
    return false;
  }
}

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
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

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
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const parsed = normalizePayload(await request.json().catch(() => ({})));
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { error } = await createServiceClient()
      .from('custom_setup_offers')
      .insert({ ...parsed.data, created_at: new Date().toISOString() });

    if (error) throw error;
    return NextResponse.json({ message: 'Offer created successfully' }, { status: 201 });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.create_failed', { error });
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });

    const parsed = normalizePayload(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { error } = await createServiceClient()
      .from('custom_setup_offers')
      .update(parsed.data)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Offer updated successfully' });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.update_failed', { error });
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });

    const { error } = await createServiceClient()
      .from('custom_setup_offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    logger.error('superadmin_custom_setup_offers.delete_failed', { error });
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}