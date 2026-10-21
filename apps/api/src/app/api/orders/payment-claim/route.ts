import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { getTrustedClientIp, rateLimit } from '@tecbunny/core/server';
import { resolveCaller } from '../../../../lib/v1-auth';
import { verifyGuestOrderAccessToken } from '../../../../lib/guest-order-access';

const claimSchema = z.object({
  orderId: z.string().uuid(),
  utr: z.string().trim().regex(/^[A-Za-z0-9-]{6,35}$/),
});

export async function POST(request: NextRequest) {
  const parsed = claimSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid UPI transaction reference.' }, { status: 400 });
  }
  if (!isSupabaseServiceConfigured) {
    return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 });
  }

  const { orderId, utr } = parsed.data;
  const ipLimit = await rateLimit(`upi-payment-claim:ip:${getTrustedClientIp(request)}`, 20, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const client = createSupabaseServiceClient();
  const { data: order, error: loadError } = await client
    .from('orders')
    .select('id, customer_id, payment_method, payment_status, payment_reference, status')
    .eq('id', orderId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: 'Unable to load this order.' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const isGuestCapabilityValid = verifyGuestOrderAccessToken(
    request.headers.get('x-guest-order-token'),
    orderId,
  );
  if (!isGuestCapabilityValid) {
    const caller = await resolveCaller(request);
    if (!caller || order.customer_id !== caller.userId) {
      return NextResponse.json({ error: 'You are not allowed to submit payment details for this order.' }, { status: caller ? 403 : 401 });
    }
  }

  if ((order.payment_method ?? '').toLowerCase() !== 'upi') {
    return NextResponse.json({ error: 'This order is not awaiting UPI payment.' }, { status: 409 });
  }
  if (!['pending', 'awaiting payment'].includes((order.status ?? '').toLowerCase())) {
    return NextResponse.json({ error: 'This order is not in a payable state.' }, { status: 409 });
  }
  if ((order.payment_status ?? '').toLowerCase() === 'payment confirmed') {
    return NextResponse.json({ error: 'This order has already been marked paid.' }, { status: 409 });
  }

  const orderLimit = await rateLimit(`upi-payment-claim:order:${orderId}`, 3, 15 * 60 * 1000);
  if (!orderLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  if (order.payment_reference) {
    return NextResponse.json({ error: 'A payment reference has already been submitted for this order.' }, { status: 409 });
  }

  let updateQuery = client
    .from('orders')
    .update({ payment_reference: utr, payment_status: 'Payment Confirmation Pending' })
    .eq('id', orderId)
    .eq('payment_method', 'upi')
    .eq('status', order.status)
    .is('payment_reference', null)
    .select('id');
  updateQuery = order.payment_status === null
    ? updateQuery.is('payment_status', null)
    : updateQuery.eq('payment_status', order.payment_status);
  const { data: updated, error: updateError } = await updateQuery.maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: 'Unable to submit payment details.' }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: 'A payment reference has already been submitted for this order.' }, { status: 409 });
  }

  return NextResponse.json({
    success: true,
    paymentStatus: 'Payment Confirmation Pending',
    message: 'Your transaction reference was submitted for verification. This does not confirm payment.',
  });
}
