import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { cashfreeConfig, minorUnits, ownedOrder, PaymentError } from '../shared';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'cashfree_verify', { limit: 20, windowMs: 60_000 })) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  try {
    const params = request.nextUrl.searchParams;
    const transactionId = params.get('cf_order_id');
    const orderId = params.get('order_id');
    if (!transactionId || !orderId) throw new PaymentError('cf_order_id and order_id are required', 400);
    const { supabase, order } = await ownedOrder(orderId);
    const { data: transaction, error } = await supabase.from('payment_transactions').select('order_id, transaction_id, amount, status, gateway_response').eq('transaction_id', transactionId).eq('payment_method', 'cashfree').maybeSingle();
    if (error) throw new PaymentError('Could not load payment session', 503);
    if (!transaction || String(transaction.order_id) !== orderId) throw new PaymentError('Payment does not belong to this order', 409);
    const environment = transaction.gateway_response?.environment;
    if (environment !== 'sandbox' && environment !== 'production') throw new PaymentError('Payment session environment is missing', 409);
    const config = cashfreeConfig(environment);
    const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(transactionId)}`, { headers: config.headers, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new PaymentError('Could not verify payment', 502);
    const gateway = await response.json();
    if (gateway.order_id !== transactionId || gateway.order_currency !== 'INR' || minorUnits(gateway.order_amount) !== minorUnits(transaction.amount) || minorUnits(order.total) !== minorUnits(transaction.amount)) throw new PaymentError('Payment transaction mismatch', 409);
    if (gateway.order_status !== 'PAID') return NextResponse.json({ order_status: gateway.order_status, is_paid: false }, { headers: { 'Cache-Control': 'no-store' } });
    const { data: settlement, error: settlementError } = await supabase.rpc('settle_gateway_payment', {
      p_order_id: orderId, p_transaction_id: transactionId, p_payment_method: 'cashfree', p_status: 'success', p_amount: Number(transaction.amount), p_gateway_response: { ...gateway, environment, currency: 'INR' },
    });
    if (settlementError || settlement?.status !== 'success') throw new PaymentError('Payment received; order confirmation is pending. Please retry verification.', 503);
    return NextResponse.json({ order_status: 'PAID', is_paid: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    logger.error('cashfree.verify.failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: error instanceof PaymentError ? error.message : 'Payment verification is temporarily unavailable', is_paid: false }, { status: error instanceof PaymentError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
export const runtime = 'nodejs';
