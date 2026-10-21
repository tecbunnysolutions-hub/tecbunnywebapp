import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification, toPaymentData } from '../../../../lib/notification-guard';

const isFailed = (status: unknown) => /^(payment failed|failed)$/i.test(String(status ?? '').trim());

export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'email_payment_failed',
    allow: ['internal', 'staff', 'owner'],
    limit: 3,
    windowMs: 5 * 60 * 1000,
    channel: 'email',
    successMessage: 'Payment failed email sent',
    failureMessage: 'Failed to send payment failed email',
    precondition: (order) => (isFailed(order.payment_status) ? null : 'Payment has not failed for this order'),
    send: ({ email, orderData, order }) => emailHelpers.sendPaymentFailed(email as string, orderData, toPaymentData(order)),
  });
}
