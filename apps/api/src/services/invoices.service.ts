import type { SupabaseClient } from '@supabase/supabase-js';

import { ServiceError } from './errors';

type Row = Record<string, unknown>;

const PRODUCT_COLUMNS = 'id, hsn_code, hsn, hsn_sac, gst_rate, gst_percentage';

/** Order row plus the product tax fields needed to render an invoice. */
export async function getInvoiceData(db: SupabaseClient, orderId: string) {
  const { data: order, error } = await db.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load order.');
  if (!order) throw new ServiceError(404, 'NOT_FOUND', 'Order not found.');

  const items = Array.isArray((order as Row).items) ? ((order as Row).items as Row[]) : [];
  const ids = Array.from(
    new Set(
      items
        .map((item) => item.productId ?? item.product_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  );
  if (ids.length === 0) return { order: order as Row, products: [] as Row[] };

  const { data: products, error: productError } = await db.from('products').select(PRODUCT_COLUMNS).in('id', ids);
  if (productError) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load invoice products.');
  return { order: order as Row, products: (products ?? []) as Row[] };
}
