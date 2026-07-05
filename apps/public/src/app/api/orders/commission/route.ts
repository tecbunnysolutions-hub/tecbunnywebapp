import { NextResponse } from 'next/server';

import { enhancedCommissionService } from '@/lib/enhanced-commission-service';
import { AdminAuthError, requireAdminContext } from '@/lib/auth/admin-guard';
import { logger } from '@/lib/logger';

// export const dynamic = 'force-dynamic';

// POST /api/orders/commission
// Calculates and awards commission when an order is completed
export async function POST(request: Request) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    // 1. Get the order details to find the referring agent
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, agent_id, status')
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      }
      throw new Error(`Error fetching order: ${orderError.message}`);
    }

    // 2. Check if order is completed and has a referring agent
    const normalizedStatus = typeof order.status === 'string' ? order.status.toLowerCase() : '';
    if (normalizedStatus !== 'completed') {
      return NextResponse.json({ error: 'Commission can only be awarded for completed orders.' }, { status: 400 });
    }

    if (!order.agent_id) {
      return NextResponse.json({ message: 'No referring agent for this order. No commission to award.' });
    }

    // 3. Check if commission has already been awarded for this order
    const { data: existingCommission, error: commissionCheckError } = await supabase
      .from('sales_agent_commissions')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (commissionCheckError && commissionCheckError.code !== 'PGRST116') {
      throw new Error(`Error checking existing commission: ${commissionCheckError.message}`);
    }

    if (existingCommission) {
      return NextResponse.json({ message: 'Commission has already been awarded for this order.' });
    }

    // 4. Award the commission
    const orderTotal = Number(order.total ?? 0);

    await enhancedCommissionService.awardCommission(
      orderId,
      order.agent_id,
      orderTotal
    );

    return NextResponse.json({ 
      message: 'Commission calculated and awarded successfully.',
      orderId,
      agentId: order.agent_id,
      orderTotal
    });

  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error('orders_commission.unhandled', { error: error instanceof Error ? error.message : error });
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
