import type { SupabaseClient } from '@supabase/supabase-js';

import { ServiceError } from './errors';

type Result<T> = { data: T | null; error: { message: string } | null };

const rows = <T>(result: Result<T[]>, label: string): T[] => {
  if (result.error) throw new ServiceError(500, 'QUERY_FAILED', `Failed to load ${label}.`);
  return result.data ?? [];
};

/** Everything the profile screen needs, always scoped to `userId` (callers never pass another id). */
export async function getMeOverview(db: SupabaseClient, userId: string) {
  const [profile, salesAgent, orders, tickets, quotes] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    db.from('sales_agents').select('*').eq('user_id', userId).maybeSingle(),
    db
      .from('orders')
      .select('id, status, total, total_amount, created_at, type')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
    db
      .from('service_tickets')
      .select('id, issue_description, status, priority, created_at')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('quotes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  if (profile.error) throw new ServiceError(500, 'QUERY_FAILED', 'Failed to load profile.');

  return {
    profile: (profile.data as Record<string, unknown> | null) ?? null,
    salesAgent: (salesAgent.data as Record<string, unknown> | null) ?? null,
    orders: rows(orders as Result<Record<string, unknown>[]>, 'orders'),
    serviceTickets: rows(tickets as Result<Record<string, unknown>[]>, 'service tickets'),
    quotes: rows(quotes as Result<Record<string, unknown>[]>, 'quotes'),
  };
}
