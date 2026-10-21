import type { SupabaseClient } from '@supabase/supabase-js';

import { ServiceError } from './errors';

type Row = Record<string, unknown>;

const PRODUCT_COLUMNS = 'id, hsn_code, hsn, hsn_sac, gst_rate, gst_percentage';

function toInvoiceOrder(order: Row): Row {
  const {
    payment_reference: _paymentReference,
    payment_id: _paymentId,
    razorpay_order_id: _razorpayOrderId,
    razorpay_payment_id: _razorpayPaymentId,
    stripe_payment_intent: _stripePaymentIntent,
    notes: _notes,
    metadata: _metadata,
    processed_by: _processedBy,
    assigned_to: _assignedTo,
    ...safe
  } = order;
  return safe;
}

/** Order row plus the product tax fields needed to render an invoice. */
export async function getInvoiceData(db: SupabaseClient, orderId: string) {
  const { data: order, error } = await db.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load order.');
  if (!order) throw new ServiceError(404, 'NOT_FOUND', 'Order not found.');

  const invoiceOrder = toInvoiceOrder(order as Row);
  const items = Array.isArray(invoiceOrder.items) ? (invoiceOrder.items as Row[]) : [];
  const ids = Array.from(
    new Set(
      items
        .map((item) => item.productId ?? item.product_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  );
  if (ids.length === 0) return { order: invoiceOrder, products: [] as Row[] };

  const { data: products, error: productError } = await db.from('products').select(PRODUCT_COLUMNS).in('id', ids);
  if (productError) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load invoice products.');
  return { order: invoiceOrder, products: (products ?? []) as Row[] };
}
