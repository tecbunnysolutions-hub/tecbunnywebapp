import { createSupabaseServiceClient } from "@tecbunny/core/server";
import { NextRequest, NextResponse } from 'next/server';

import { WhatsAppService } from "@tecbunny/core/whatsapp-service";
import { logger } from "@tecbunny/core";
import { randomBytes, timingSafeEqual } from 'crypto';

const DELIVERED_STATUSES = new Set(['delivered', 'delivered/picked up', 'completed']);

function isInternalRequest(request: NextRequest) {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = request.headers.get('x-internal-api-key');
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Triggered after order delivery to send localized upsell offers
 * Based on inventory metadata (surveillance/hardware)
 */
export async function POST(request: NextRequest) {
  // Server-to-server trigger only: it mints coupons and messages customers.
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const whatsapp = new WhatsAppService();

    // 1. Fetch order with items and customer details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        total,
        items,
        status,
        customer_id
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      logger.error('upsell_trigger_order_fetch_failed', { orderId, error: orderError });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!DELIVERED_STATUSES.has(String(order.status ?? '').trim().toLowerCase())) {
      return NextResponse.json({ success: true, message: 'Order is not delivered' });
    }

    // 2. Evaluate inventory for upsell potential (Surveillance/Hardware)
    const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : order.items;
    const items: any[] = Array.isArray(parsedItems) ? parsedItems : (Array.isArray(parsedItems?.cart_items) ? parsedItems.cart_items : []);
    const hasHardware = items.some(item => {
      const name = String(item?.name ?? '').toLowerCase();
      return name.includes('camera') || name.includes('dvr') || name.includes('nvr') || name.includes('cctv');
    });

    if (!hasHardware) {
      return NextResponse.json({ success: true, message: 'No upsell conditions met' });
    }

    // 3. One upsell coupon per order.
    const couponDescription = `Post-delivery surveillance accessory upgrade (order ${order.id})`;
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('description', couponDescription)
      .limit(1)
      .maybeSingle();
    if (existingCoupon) {
      return NextResponse.json({ success: true, triggered: false, message: 'Upsell already sent for this order' });
    }

    const couponCode = `UPGRADE-${randomBytes(6).toString('hex').toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);

    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        type: 'percentage',
        value: 15,
        status: 'active',
        expiry_date: expiryDate.toISOString(),
        description: couponDescription,
        per_user_limit: 1,
        usage_limit: 1
      });

    if (couponError) {
      logger.error('upsell_trigger_coupon_generation_failed', { orderId, error: couponError });
      return NextResponse.json({ error: 'Failed to create upsell coupon' }, { status: 500 });
    }

    // 4. Dispatch Meta WhatsApp Payload
    if (order.customer_phone) {
      const payload = {
        templateName: 'surveillance_upsell_1',
        templateData: {
          body: {
            placeholders: [order.customer_name || 'Valued Customer', '15%', couponCode]
          },
          buttons: [
            {
              type: 'URL',
              parameter: `checkout?coupon=${couponCode}&source=upsell`
            }
          ]
        },
        language: 'en_US'
      };

      await whatsapp.sendMessage(order.customer_phone, payload, 'template', 'orderUpdates');
      
      logger.info('upsell_whatsapp_dispatched', { orderId, couponCode });
    }

    return NextResponse.json({ success: true, triggered: true });

  } catch (error: any) {
    logger.error('upsell_trigger_error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
