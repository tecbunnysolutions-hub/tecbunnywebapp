import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';

const CF_ENV = (process.env.CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production';
const CF_BASE_URL =
  CF_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
const CF_APP_ID =
  CF_ENV === 'production'
    ? process.env.CASHFREE_PROD_APP_ID ?? ''
    : process.env.CASHFREE_SANDBOX_APP_ID ?? '';
const CF_SECRET =
  CF_ENV === 'production'
    ? process.env.CASHFREE_PROD_SECRET_KEY ?? ''
    : process.env.CASHFREE_SANDBOX_SECRET_KEY ?? '';

export async function GET(request: NextRequest) {
  const clientIP =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!rateLimit(clientIP, 'cashfree_verify', { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const cfOrderId = searchParams.get('cf_order_id');
  const orderId = searchParams.get('order_id');

  if (!cfOrderId || !orderId) {
    return NextResponse.json({ error: 'cf_order_id and order_id are required' }, { status: 400 });
  }

  try {
    const cfRes = await fetch(`${CF_BASE_URL}/orders/${cfOrderId}`, {
      headers: {
        Accept: 'application/json',
        'X-Client-Id': CF_APP_ID,
        'X-Client-Secret': CF_SECRET,
        'x-api-version': '2025-01-01',
      },
      cache: 'no-store',
    });

    if (!cfRes.ok) {
      logger.error('cashfree.verify.api_error', { cfOrderId, status: cfRes.status });
      return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 });
    }

    const cfOrder = await cfRes.json();
    const isPaid = cfOrder.order_status === 'PAID';

    if (isPaid) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'Payment Confirmed',
          payment_status: 'Payment Confirmed',
          payment_method: 'cashfree',
        })
        .eq('id', orderId);

      if (error) {
        logger.error('cashfree.verify.order_update_failed', { orderId, error });
      }
    }

    return NextResponse.json({
      order_status: cfOrder.order_status,
      is_paid: isPaid,
    });
  } catch (error) {
    logger.error('cashfree.verify.unexpected', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
