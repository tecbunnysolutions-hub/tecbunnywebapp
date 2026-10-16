import { createSupabaseServiceClient } from "@tecbunny/core/server";
import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { WhatsAppService } from "@tecbunny/core/whatsapp-service";
import { logger } from "@tecbunny/core";
import { requireInternalAccess } from '@/lib/internal-auth';

/**
 * Triggered after order delivery to send localized upsell offers
 * Based on inventory metadata (surveillance/hardware)
 */
export async function POST(request: NextRequest) {
  const accessDenied = requireInternalAccess(request);
  if (accessDenied) return accessDenied;

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
        customer_id
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      logger.error('upsell_trigger_order_fetch_failed', { orderId, error: orderError });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Evaluate inventory for upsell potential (Surveillance/Hardware)
    const items = Array.isArray(order.items) ? order.items : [];
    const hasHardware = items.some((item: unknown) => {
      if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return false;
      const name = item.name.toLowerCase();
      return name.includes('camera') || name.includes('dvr') || name.includes('nvr') || name.includes('cctv');
    });

    if (!hasHardware) {
      return NextResponse.json({ success: true, message: 'No upsell conditions met' });
    }

    // 3. Generate one dynamic coupon per delivered order.
    const upsellMarker = `Post-delivery surveillance accessory upgrade [order:${orderId}]`;
    const { data: existingCoupon, error: existingCouponError } = await supabase
      .from('coupons')
      .select('id')
      .eq('description', upsellMarker)
      .maybeSingle();

    if (existingCouponError) {
      logger.error('upsell_trigger_coupon_lookup_failed', { orderId, error: existingCouponError });
      return NextResponse.json({ error: 'Could not check existing upsell' }, { status: 500 });
    }
    if (existingCoupon) {
      return NextResponse.json({ success: true, triggered: false, message: 'Upsell already sent for this order' });
    }

    const couponCode = `UPGRADE-${randomBytes(5).toString('hex').toUpperCase()}`;
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
        description: upsellMarker,
        per_user_limit: 1,
        usage_limit: 1
      });

    if (couponError) {
      logger.error('upsell_trigger_coupon_generation_failed', { orderId, error: couponError });
      return NextResponse.json({ error: 'Could not create upsell coupon' }, { status: 500 });
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

    return NextResponse.json({ 
      success: true, 
      triggered: true, 
      coupon: couponCode 
    });

  } catch (error: any) {
    logger.error('upsell_trigger_error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
