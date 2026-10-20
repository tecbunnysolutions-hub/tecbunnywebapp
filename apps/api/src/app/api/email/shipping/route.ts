import { NextRequest } from 'next/server';

import { emailHelpers } from '@tecbunny/core/email';

import { handleOrderNotification } from '../../../../lib/notification-guard';

interface ShippingExtra {
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const short = (value: unknown) => (typeof value === 'string' && value.length <= 120 ? value : undefined);

// Staff or internal only. Tracking details are the only values taken from the body.
export async function POST(request: NextRequest) {
  return handleOrderNotification<ShippingExtra>(request, {
    bucket: 'email_shipping',
    allow: ['internal', 'staff'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'email',
    successMessage: 'Shipping notification email sent successfully',
    failureMessage: 'Failed to send shipping notification email',
    parseExtra: (body) => {
      const raw = body.shippingData;
      if (raw === undefined) return { ok: true, data: {} };
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid shippingData' };
      const { trackingNumber, estimatedDelivery } = raw as Record<string, unknown>;
      return { ok: true, data: { trackingNumber: short(trackingNumber), estimatedDelivery: short(estimatedDelivery) } };
    },
    send: ({ email, orderData, extra }) => emailHelpers.sendShippingNotification(email as string, orderData, extra),
  });
}
