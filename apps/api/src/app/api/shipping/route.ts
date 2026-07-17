import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core';
import { apiError, apiSuccess } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';

const CreateDispatchSchema = z.object({
  order_id: z.string().uuid(),
  carrier: z.string().min(1).max(100),
  tracking_number: z.string().min(1).max(200),
  estimated_delivery: z.string().datetime({ offset: true }).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * GET /api/shipping
 * List dispatch records. Staff only.
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || undefined;

  try {
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return apiError('UNAUTHORIZED', { correlationId });
    if (!isAtLeast(role!, 'delivery')) return apiError('FORBIDDEN', { correlationId });

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '25')));

    const supabase = await createClient();
    let query = supabase
      .from('dispatch_records')
      .select('*, orders(id, customer_name, customer_phone, delivery_address, total)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (orderId) query = query.eq('order_id', orderId);
    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;
    if (error) {
      logger.error('dispatch.list_failed', { error: error.message, correlationId });
      return apiError('INTERNAL_ERROR', { correlationId });
    }

    return apiSuccess({ records: data || [], total: count ?? 0, page, pageSize }, correlationId);
  } catch (err: any) {
    logger.error('dispatch.get_uncaught', { error: err.message });
    return apiError('INTERNAL_ERROR', { correlationId });
  }
}

/**
 * POST /api/shipping
 * Create a dispatch record and mark order as Shipped.
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || undefined;

  try {
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return apiError('UNAUTHORIZED', { correlationId });
    if (!isAtLeast(role!, 'delivery')) return apiError('FORBIDDEN', { correlationId });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rlResult = await rateLimit(`dispatch:${session.user.id}`, 20, 60_000);
    if (!rlResult.allowed) return apiError('RATE_LIMITED', { correlationId });

    const body = await request.json().catch(() => null);
    if (!body) return apiError('VALIDATION_ERROR', { correlationId, overrideMessage: 'Invalid JSON body' });

    const parsed = CreateDispatchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', {
        correlationId,
        overrideMessage: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { order_id, carrier, tracking_number, estimated_delivery, notes } = parsed.data;

    const supabase = await createClient();

    // Verify order exists and isn't already dispatched
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, status, customer_name, customer_phone')
      .eq('id', order_id)
      .maybeSingle();

    if (orderErr || !order) return apiError('NOT_FOUND', { correlationId, overrideMessage: 'Order not found' });

    // Insert dispatch record
    const { data: record, error: insertErr } = await supabase
      .from('dispatch_records')
      .insert({
        order_id,
        carrier,
        tracking_number,
        status: 'shipped',
        estimated_delivery: estimated_delivery ?? null,
        notes: notes ?? null,
        dispatched_by: session.user.id,
      })
      .select()
      .single();

    if (insertErr) {
      logger.error('dispatch.insert_failed', { error: insertErr.message, correlationId });
      return apiError('INTERNAL_ERROR', { correlationId });
    }

    // Update order status to Shipped
    await supabase
      .from('orders')
      .update({ status: 'Shipped', updated_at: new Date().toISOString() })
      .eq('id', order_id);

    logger.info('dispatch.created', { orderId: order_id, carrier, trackingNumber: tracking_number, userId: session.user.id });

    return apiSuccess({ record }, correlationId);
  } catch (err: any) {
    logger.error('dispatch.post_uncaught', { error: err.message });
    return apiError('INTERNAL_ERROR', { correlationId });
  }
}
