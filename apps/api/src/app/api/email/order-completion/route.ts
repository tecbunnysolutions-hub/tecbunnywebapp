import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification } from '../../../../lib/notification-guard';

// Staff or internal only: customers must not trigger lifecycle emails.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'email_order_completion',
    allow: ['internal', 'staff'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'email',
    successMessage: 'Order completion email sent successfully',
    failureMessage: 'Failed to send order completion email',
    send: ({ email, orderData }) => emailHelpers.sendOrderCompletion(email as string, orderData),
  });
}
