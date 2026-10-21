import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification, toPaymentData } from '../../../../lib/notification-guard';

const isPending = (order: Record<string, any>) =>
  /^(payment confirmation pending|awaiting payment|pending)$/i.test(String(order.payment_status ?? '').trim()) ||
  /^awaiting payment$/i.test(String(order.status ?? '').trim());

export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'email_payment_pending',
    allow: ['internal', 'staff', 'owner'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'email',
    successMessage: 'Payment pending email sent',
    failureMessage: 'Failed to send payment pending email',
    precondition: (order) => (isPending(order) ? null : 'Payment is not pending for this order'),
    send: ({ email, orderData, order }) => emailHelpers.sendPaymentPending(email as string, orderData, toPaymentData(order)),
  });
}
