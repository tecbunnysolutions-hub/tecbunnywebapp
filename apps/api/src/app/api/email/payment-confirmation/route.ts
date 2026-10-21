import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification, toPaymentData } from '../../../../lib/notification-guard';

const isConfirmed = (status: unknown) => /^(payment confirmed|paid|success|completed)$/i.test(String(status ?? '').trim());

// Only sent once the order record itself says the payment is confirmed.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'email_payment_confirmation',
    allow: ['internal', 'staff', 'owner'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'email',
    successMessage: 'Payment confirmation email sent successfully',
    failureMessage: 'Failed to send payment confirmation email',
    precondition: (order) => (isConfirmed(order.payment_status) ? null : 'Payment is not confirmed for this order'),
    send: ({ email, orderData, order }) => emailHelpers.sendPaymentConfirmation(email as string, orderData, toPaymentData(order)),
  });
}
