import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadminContext } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core/logger";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireSuperadminContext();
    const { data, error } = await serviceSupabase
      .from('custom_setup_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ offers: data });
  } catch (error: any) {
    logger.error('Failed to fetch custom setup offers', { error });
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireSuperadminContext();
    const body = await request.json();
    
    const { data, error } = await serviceSupabase
      .from('custom_setup_offers')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ offer: data, message: 'Offer created successfully' });
  } catch (error: any) {
    logger.error('Failed to create custom setup offer', { error });
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireSuperadminContext();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await serviceSupabase
      .from('custom_setup_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ offer: data, message: 'Offer updated successfully' });
  } catch (error: any) {
    logger.error('Failed to update custom setup offer', { error });
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireSuperadminContext();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });

    const { error } = await serviceSupabase
      .from('custom_setup_offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error: any) {
    logger.error('Failed to delete custom setup offer', { error });
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
