import { createClient as createServerClient } from '@tecbunny/database';

import { createSupabaseServiceClient, isSupabaseServiceConfigured } from "@tecbunny/core/server";;
import { NextRequest, NextResponse } from 'next/server';
import { deserializeOrder } from "@tecbunny/core/orders/normalizers";
import { logger } from "@tecbunny/core";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = isSupabaseServiceConfigured ? createSupabaseServiceClient() : await createServerClient();
    
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

    // IDOR Protection: Enforce ownership
    const { data: { user } } = await (await createServerClient()).auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = user.app_metadata?.role || 'customer';
    
    // Lazy import of requireOwnership to avoid edge/node circular dependency issues if any
    const { requireOwnership } = await import('@tecbunny/core/auth/ownership-guard');
    const isOwner = await requireOwnership(user.id, userRole, order.user_id, 'order');
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalized = deserializeOrder(order);
    return NextResponse.json({ success: true, order: normalized });
  } catch (error: any) {
    logger.error('uncaught_error_in_fetch_order_by_id_api', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
