import { NextRequest } from 'next/server';

import { logger } from '@tecbunny/core';
import { sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';

import { handleOrderNotification } from '../../../../lib/notification-guard';

// Internal team numbers (TEAM_WHATSAPP_1/2): staff or internal callers only.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'whatsapp_sales_pickup',
    allow: ['internal', 'staff'],
    limit: 10,
    windowMs: 10 * 60 * 1000,
    channel: 'team',
    successMessage: 'Sales pickup WhatsApp sent',
    failureMessage: 'Failed to send sales pickup notification',
    send: async ({ orderData }) => {
      const teamNumbers = [process.env.TEAM_WHATSAPP_1, process.env.TEAM_WHATSAPP_2].filter(Boolean) as string[];
      if (teamNumbers.length === 0) return true;

      const message = `
🏬 Pickup Order Alert!

📦 Order: ${orderData.id}
⚠️ Action Required: Customer is arriving for pickup / Pick up initiated.
Check dashboard for details.
      `.trim();
      try {
        for (const number of teamNumbers) await sendWhatsAppNotification(number, message);
        return true;
      } catch (error) {
        logger.error('Sales pickup notification WhatsApp failed', { error: error instanceof Error ? error.message : String(error) });
        return false;
      }
    },
  });
}
