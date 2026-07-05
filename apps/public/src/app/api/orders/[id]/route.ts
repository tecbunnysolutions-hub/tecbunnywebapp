import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient, createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { deserializeOrder } from '@/lib/orders/normalizers';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = isSupabaseServiceConfigured ? createServiceClient() : await createServerClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('failed_to_fetch_order_by_id_api', { id, error: error.message });
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const normalized = deserializeOrder(order);
    return NextResponse.json({ success: true, order: normalized });
  } catch (error: any) {
    logger.error('uncaught_error_in_fetch_order_by_id_api', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
