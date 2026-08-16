import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';

const CF_ENV = (process.env.CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production';
const CF_BASE_URL =
  CF_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
// Separate credentials per environment so both can coexist
const CF_APP_ID =
  CF_ENV === 'production'
    ? process.env.CASHFREE_PROD_APP_ID ?? ''
    : process.env.CASHFREE_SANDBOX_APP_ID ?? '';
const CF_SECRET =
  CF_ENV === 'production'
    ? process.env.CASHFREE_PROD_SECRET_KEY ?? ''
    : process.env.CASHFREE_SANDBOX_SECRET_KEY ?? '';

export async function POST(request: NextRequest) {
  const clientIP =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!rateLimit(clientIP, 'cashfree_create_order', { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { order_id } = body as { order_id?: string };

    if (!order_id || typeof order_id !== 'string') {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, total, customer_name, customer_email, customer_phone')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      logger.warn('cashfree.create_order.not_found', { order_id });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tecbunny.com';
    // Strip non-digits, take last 10
    const phone = String(order.customer_phone || '').replace(/\D/g, '').slice(-10);

    const cfPayload = {
      order_amount: Number(order.total).toFixed(2),
      order_currency: 'INR',
      customer_details: {
        // Cashfree customer_id max 32 chars, no hyphens allowed
        customer_id: `TB${order_id.replace(/-/g, '').slice(0, 30)}`,
        customer_name: String(order.customer_name || 'Customer').slice(0, 100),
        customer_email: order.customer_email || 'noreply@tecbunny.com',
        customer_phone: phone.length === 10 ? phone : '9999999999',
      },
      order_meta: {
        return_url: `${siteUrl}/payment/cashfree/${order_id}/confirm`,
      },
      order_note: `TecBunny ${order_id.slice(0, 8)}`,
    };

    const cfRes = await fetch(`${CF_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client-Id': CF_APP_ID,
        'X-Client-Secret': CF_SECRET,
        'x-api-version': '2025-01-01',
      },
      body: JSON.stringify(cfPayload),
    });

    if (!cfRes.ok) {
      const err = await cfRes.json().catch(() => ({}));
      logger.error('cashfree.create_order.api_error', { status: cfRes.status, err });
      return NextResponse.json(
        { error: 'Payment gateway error', details: err },
        { status: 502 }
      );
    }

    const cfData = await cfRes.json();
    return NextResponse.json({
      payment_session_id: cfData.payment_session_id,
      cf_order_id: cfData.cf_order_id,
    });
  } catch (error) {
    logger.error('cashfree.create_order.unexpected', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
