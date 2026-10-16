import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdminOrdersQuery } from '@tecbunny/contracts';

import { ServiceError } from './errors';

const DEFAULT_LIMIT = 200;

/** Order list for staff screens. Non-admin callers are always limited to orders they processed. */
export async function listAdminOrders(
  db: SupabaseClient,
  query: AdminOrdersQuery,
  caller: { userId: string; canViewAll: boolean },
) {
  let builder = db.from('orders').select('*', { count: 'exact' });

  if (query.type) builder = builder.eq('type', query.type);
  if (query.status) builder = builder.eq('status', query.status);
  if (query.paymentStatus) builder = builder.eq('payment_status', query.paymentStatus);
  if (query.search) builder = builder.ilike('id', `%${query.search.replace(/[%_]/g, '\\$&')}%`);

  if (query.processedBy) {
    const target = query.processedBy === 'me' ? caller.userId : query.processedBy;
    if (target !== caller.userId && !caller.canViewAll) {
      throw new ServiceError(403, 'FORBIDDEN', 'You can only view orders you processed.');
    }
    builder = builder.eq('processed_by', target);
  }

  const { data, count, error } = await builder.order('created_at', { ascending: false }).limit(query.limit ?? DEFAULT_LIMIT);
  if (error) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load orders.');
  return { orders: (data ?? []) as Record<string, unknown>[], total: count ?? data?.length ?? 0 };
}
