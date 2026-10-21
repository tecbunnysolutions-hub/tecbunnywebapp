import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification } from '../../../../lib/notification-guard';

// Owner, staff or internal. Recipient and order data come from the order record.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'email_order_confirmation',
    allow: ['internal', 'staff', 'owner'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'email',
    successMessage: 'Order confirmation email sent successfully',
    failureMessage: 'Failed to send order confirmation email',
    send: ({ email, orderData }) => emailHelpers.sendOrderConfirmation(email as string, orderData),
  });
}
