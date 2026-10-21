import { NextRequest } from 'next/server';

import { logger } from '@tecbunny/core';
import { getAdminDb } from '@tecbunny/core/server';
import { sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';

import {
  authorizeNotification,
  jsonError,
  jsonOk,
  readJsonObject,
  recordNotificationSkip,
  resolveTargetUser,
} from '../../../../lib/notification-guard';

// Abandoned cart reminders: 3 per 12h per user. The user (or the cron via the internal token)
// triggers it; phone, name and cart items all come from the database.
export async function POST(request: NextRequest) {
  try {
    const gate = await authorizeNotification(request, {
      bucket: 'whatsapp_abandoned_cart',
      allow: ['internal', 'owner'],
      limit: 3,
      windowMs: 12 * 60 * 60 * 1000,
    });
    if ('error' in gate) return gate.error;

    const body = (await readJsonObject(request)) ?? {};
    const resolved = await resolveTargetUser(gate.caller, body);
    if ('error' in resolved) return resolved.error;
    const { target } = resolved;

    if (!target.phone) {
      recordNotificationSkip('abandoned_cart.no_profile_mobile', { userId: target.userId });
      return jsonOk({ skipped: true, message: 'Skipped - No phone number' });
    }

    const { data: cart, error } = await getAdminDb()
      .from('carts')
      .select('items, updated_at')
      .eq('user_id', target.userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return jsonError(503, 'Could not load cart');

    if (!cart) {
      recordNotificationSkip('abandoned_cart.cart_not_synced', { userId: target.userId });
      return jsonOk({ skipped: true, message: 'Skipped - no synced active cart' });
    }
    const cartItems = Array.isArray(cart.items) ? cart.items : [];
    if (cartItems.length === 0) {
      recordNotificationSkip('abandoned_cart.empty_cart', { userId: target.userId });
      return jsonOk({ skipped: true, message: 'Skipped - empty cart' });
    }

    const minutesSinceAbandoned = Math.max(
      0,
      Math.floor((Date.now() - new Date(cart?.updated_at ?? Date.now()).getTime()) / 60000),
    );
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tecbunny.com';

    await sendAbandonedCartWhatsApp(target.phone, {
      userName: target.name,
      cartItems,
      restoreCartUrl: `${siteUrl}/cart`,
      minutesSinceAbandoned,
    });

    return jsonOk({ message: 'Abandoned cart WhatsApp sent' });
  } catch (error: any) {
    logger.error('Abandoned cart API error:', { error: error.message });
    return jsonError(500, 'Internal server error');
  }
}

async function sendAbandonedCartWhatsApp(phoneNumber: string, data: any) {
  try {
    const itemCount = data.cartItems.length;
    const itemNames = data.cartItems.slice(0, 3).map((i: any) => `• ${String(i?.name ?? 'Item').slice(0, 80)}`).join('\n');
    const moreItems = itemCount > 3 ? `\n...and ${itemCount - 3} more items` : '';
    const minutesSince = data.minutesSinceAbandoned || 60;

    let subject = '';
    let body = '';
    let discountCode: string | undefined;

    if (minutesSince <= 120) {
      subject = '🛒 Did you forget something?';
      body = `Hi ${data.userName || 'there'}! We noticed you left some premium tech in your cart. They're still waiting for you, but we can't hold them forever! 🏃‍♂️`;
    } else if (minutesSince <= 480) {
      subject = '⚡ Your cart is expiring!';
      discountCode = 'SAVE5';
      body = `Hi ${data.userName || 'there'}! Your cart is about to expire. Complete your purchase in the next 2 hours and use code *${discountCode}* for an extra 5% OFF! 🎁`;
    } else {
      subject = '🔥 LAST CHANCE: Items selling out!';
      discountCode = 'BUNNY10';
      body = `This is your final reminder! Items in your cart are in high demand and may sell out soon. We've upgraded your discount to 10% with code *${discountCode}*. Don't miss out! 🐰`;
    }

    const message = `
${subject} - TecBunny Store

${body}

Items waiting for you:
${itemNames}${moreItems}

Click here to secure your order:
${data.restoreCartUrl}

Need help? Reply to this message.
    `.trim();

    await sendWhatsAppNotification(phoneNumber, message);
    logger.info('Abandoned cart WhatsApp sent', { step: minutesSince <= 120 ? 1 : minutesSince <= 480 ? 2 : 3 });
  } catch (error: any) {
    logger.error('Failed to send abandoned cart WhatsApp:', { error: error.message });
  }
}
