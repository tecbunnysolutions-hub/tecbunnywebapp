import { NextRequest } from 'next/server';

import { logger } from '@tecbunny/core';
import { sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';

import { handleOrderNotification } from '../../../../lib/notification-guard';

// Internal team numbers (TEAM_WHATSAPP_1/2): staff or internal callers only. Order facts come from the database.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'whatsapp_order_approved',
    allow: ['internal', 'staff'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'team',
    successMessage: 'Approval WhatsApp sent',
    failureMessage: 'Failed to send approval notification',
    send: async ({ orderData }) => {
      const teamNumbers = [process.env.TEAM_WHATSAPP_1, process.env.TEAM_WHATSAPP_2].filter(Boolean) as string[];
      if (teamNumbers.length === 0) return true;

      const message = `
✅ Order Approved - Admin Notification

🆔 Order: ${orderData.id}
👤 Customer: ${orderData.customer_name || 'N/A'}
💰 Total: ${orderData.total}
🚚 Type: ${orderData.type || 'Standard'}

The order has been approved and is ready for processing.
      `.trim();
      try {
        for (const number of teamNumbers) await sendWhatsAppNotification(number, message);
        return true;
      } catch (error) {
        logger.error('Order approval WhatsApp failed', { error: error instanceof Error ? error.message : String(error) });
        return false;
      }
    },
  });
}
