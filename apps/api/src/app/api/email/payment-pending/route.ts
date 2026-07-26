import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { emailHelpers } from "@tecbunny/core/email";
import { handleEmailPost } from "@tecbunny/core/api-email-route";
import { logger } from '@tecbunny/core/logger';

interface PaymentPendingPayload { to: string; orderData: any; paymentData?: any }

export async function POST(request: NextRequest) {
  try {
    logger.info('email_payment_pending.audit.requested');
    return await handleEmailPost<PaymentPendingPayload>(request as any, {
      rate: { bucket: 'email_payment_pending', limit: 5, windowMs: 10 * 60 * 1000 },
      validate(body: any) {
        const { to, orderData, paymentData } = body || {};
        if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: 'Invalid recipient email' } as const;
        if (!orderData || typeof orderData !== 'object') return { ok: false, error: 'Invalid orderData' } as const;
        return { ok: true, data: { to, orderData, paymentData } } as const;
      },
      async action(data) {
        return emailHelpers.sendPaymentPending(data.to, data.orderData, data.paymentData || {});
      }
    });
  } catch (error) {
    logger.error('email_payment_pending.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to send payment pending email' }, { status: 500 });
  }
}
