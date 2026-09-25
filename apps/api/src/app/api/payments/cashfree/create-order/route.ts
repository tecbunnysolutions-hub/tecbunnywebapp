import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { cashfreeConfig, minorUnits, ownedOrder, PaymentError } from '../shared';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'cashfree_create_order', { limit: 10, windowMs: 60_000 })) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  try {
    const { order_id } = await request.json();
    if (typeof order_id !== 'string' || !order_id.trim()) throw new PaymentError('order_id is required', 400);
    const { supabase, order } = await ownedOrder(order_id);
    if (['paid', 'payment confirmed'].includes(String(order.payment_status).toLowerCase())) throw new PaymentError('Order is already paid', 409);
    const config = cashfreeConfig();
    const amount = minorUnits(order.total) / 100;
    const transactionId = `tb_${randomUUID()}`;
    const phone = String(order.customer_phone || '').replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) throw new PaymentError('A valid customer phone number is required', 400);
    // Persist the gateway/local-order association before starting checkout.
    const { error: storeError } = await supabase.from('payment_transactions').insert({ order_id, transaction_id: transactionId, payment_method: 'cashfree', amount, status: 'initiated', gateway_response: { environment: config.environment, currency: 'INR' } });
    if (storeError) throw new PaymentError('Could not record payment session; please retry', 503);
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tecbunny.com';
    const response = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST', headers: { ...config.headers, 'x-idempotency-key': transactionId.slice(3) }, signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({ order_id: transactionId, order_amount: amount, order_currency: 'INR',
        customer_details: { customer_id: `TB${order_id.replace(/-/g, '').slice(0, 30)}`, customer_name: String(order.customer_name || 'Customer').slice(0, 100), customer_email: order.customer_email, customer_phone: phone },
        order_meta: { return_url: `${site}/payment/cashfree/${encodeURIComponent(order_id)}/confirm?order_id=${transactionId}` } }),
    });
    if (!response.ok) throw new PaymentError('Payment gateway could not create a session', 502);
    const data = await response.json();
    if (data.order_id !== transactionId || typeof data.payment_session_id !== 'string' || !data.payment_session_id) throw new PaymentError('Invalid payment gateway response', 502);
    return NextResponse.json({ payment_session_id: data.payment_session_id, cf_order_id: transactionId, environment: config.environment }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    logger.error('cashfree.create_order.failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: error instanceof PaymentError ? error.message : 'Could not create payment session' }, { status: error instanceof PaymentError ? error.status : 503 });
  }
}
export const runtime = 'nodejs';
