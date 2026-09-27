import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';
import { normalizeRole } from '@tecbunny/core';

/**
 * GET /api/orders/[id]/timeline
 * Returns the full order timeline/audit trail so customers can track their order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logger.info('orders_timeline.audit.requested', { id });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, status, payment_status, customer_name, customer_phone, created_at, customer_id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only the order owner or staff may read the timeline.
    const ownerId = order.customer_id ?? order.user_id ?? null;
    if (user.id !== ownerId) {
      const role = normalizeRole((user as any).app_metadata?.role);
      if (!role || role === 'customer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Synthesise timeline from status
    const STEPS = [
      { key: 'placed',    label: 'Order Placed',        icon: '📋' },
      { key: 'confirmed', label: 'Order Confirmed',      icon: '✅' },
      { key: 'processing',label: 'Processing',           icon: '⚙️' },
      { key: 'shipped',   label: 'Shipped',              icon: '🚚' },
      { key: 'delivered', label: 'Delivered',            icon: '🏠' },
      { key: 'warranty',  label: 'Warranty Registered',  icon: '🛡️' },
    ] as const;

    const statusLower = (order.status ?? '').toLowerCase();
    const completedMap: Record<string, boolean> = {
      placed:     true,
      confirmed:  ['confirmed','processing','ready to ship','shipped','delivered','completed'].some(s => statusLower.includes(s)),
      processing: ['processing','ready to ship','shipped','delivered','completed'].some(s => statusLower.includes(s)),
      shipped:    ['shipped','in transit','delivered','completed'].some(s => statusLower.includes(s)),
      delivered:  ['delivered','completed'].some(s => statusLower.includes(s)),
      warranty:   false, // would need a join to warranty_activations
    };

    const timeline = STEPS.map(step => ({
      ...step,
      completed: completedMap[step.key] ?? false,
      active: !completedMap[step.key],
    }));

    logger.info('orders_timeline.audit.success', { id });
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        payment_status: order.payment_status,
        customer_name: order.customer_name,
        placed_at: order.created_at,
      },
      timeline,
    });
  } catch (err) {
    logger.error('orders_timeline.audit.failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
