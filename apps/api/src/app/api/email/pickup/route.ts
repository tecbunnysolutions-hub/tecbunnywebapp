import { NextRequest } from 'next/server';

import { logger } from '@tecbunny/core';
import { sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';

import { formatOrderNumber, handleOrderNotification } from '../../../../lib/notification-guard';

// Staff or internal only. Phone, order details and pickup code are derived from the order record.
export async function POST(request: NextRequest) {
  return handleOrderNotification(request, {
    bucket: 'whatsapp_pickup',
    allow: ['internal', 'staff'],
    limit: 5,
    windowMs: 10 * 60 * 1000,
    channel: 'whatsapp',
    successMessage: 'Pickup notification WhatsApp sent successfully',
    failureMessage: 'Failed to send pickup notification',
    send: async ({ phone, orderData }) => {
      const message = `
🛍️ Order Ready for Pickup! - TecBunny Store

${orderData.customer_name ? `Hi ${orderData.customer_name}! ` : ''}Your order is ready to be picked up! 🎉

📦 Order: ${formatOrderNumber(orderData.id)}
🔢 Pickup Code: *${formatOrderNumber(orderData.id)}*

📍 Pickup Location:
${orderData.pickup_store || orderData.delivery_address || 'Store Location'}

Please show this message when you arrive.
Store Hours: 10:00 AM - 8:00 PM

Questions? Reply to this message.
See you soon! 👋
      `.trim();
      try {
        await sendWhatsAppNotification(phone as string, message);
        return true;
      } catch (error) {
        logger.error('Failed to send pickup WhatsApp', { error: error instanceof Error ? error.message : String(error) });
        return false;
      }
    },
  });
}
