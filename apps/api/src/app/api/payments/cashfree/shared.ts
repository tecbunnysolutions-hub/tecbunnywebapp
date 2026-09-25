import { createSupabaseClient } from '@tecbunny/database/server';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';

export class PaymentError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function cashfreeConfig(environment = process.env.CASHFREE_ENV || 'sandbox') {
  if (environment !== 'sandbox' && environment !== 'production') throw new PaymentError('Invalid payment environment', 503);
  const prefix = environment === 'production' ? 'CASHFREE_PROD' : 'CASHFREE_SANDBOX';
  const id = process.env[`${prefix}_APP_ID`];
  const secret = process.env[`${prefix}_SECRET_KEY`];
  if (!id || !secret) throw new PaymentError('Payment gateway is not configured', 503);
  return { environment, baseUrl: environment === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Client-Id': id, 'X-Client-Secret': secret, 'x-api-version': '2025-01-01' } };
}
export function minorUnits(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || Math.round(amount * 100) <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) throw new PaymentError('Invalid payment amount', 400);
  return Math.round(amount * 100);
}
export async function ownedOrder(orderId: string) {
  const client = await createSupabaseClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new PaymentError('Authentication required', 401);
  const supabase = createSupabaseServiceClient();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new PaymentError('Could not load order', 503);
  if (!order) throw new PaymentError('Order not found', 404);
  const ownsOrder = order.user_id === user.id || order.customer_id === user.id || Boolean(user.email_confirmed_at && user.email && order.customer_email && user.email.toLowerCase() === String(order.customer_email).toLowerCase());
  if (!ownsOrder) throw new PaymentError('Access denied', 403);
  return { supabase, order };
}
