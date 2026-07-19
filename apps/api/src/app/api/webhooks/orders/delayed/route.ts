import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';


import { sendWhatsAppNotification } from "@tecbunny/core/whatsapp-service";
import { logger } from "@tecbunny/core";
import { validateWebhookSignature, validateWebhookTimestamp } from "@tecbunny/core/webhook-validator";
import { logWebhookEvent } from "@tecbunny/core/webhook-logger";

const deriveWebhookEventId = (source: string, rawBody: string, signature: string | null): string => crypto
  .createHash('sha256')
  .update(source)
  .update('\0')
  .update(signature ?? '')
  .update('\0')
  .update(rawBody)
  .digest('hex');

// Generic order delayed webhook handler
export async function POST(request: NextRequest) {
  let body: any = null;
  let rawBody = '';
  const correlationId = request.headers.get('x-correlation-id') || null;
  const startTime = new Date();

  try {
    const supabase = await createClient();
    rawBody = await request.text();

    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      logger.error('Failed to parse order delayed webhook body', { error });
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const signature = request.headers.get('x-webhook-signature');
    const source = request.headers.get('x-webhook-source') || 'unknown';
    const timestampStr = request.headers.get('x-webhook-timestamp');
    const eventId = body.id || body.event_id || body.order_id || body.order_number || deriveWebhookEventId(source, rawBody, signature);

    logger.info('Order delayed webhook received', { source, eventId, correlationId });

    if (timestampStr) {
      try {
        validateWebhookTimestamp(Number(timestampStr));
      } catch (error) {
        logger.error('Order delayed webhook timestamp validation failed', {
          error: error instanceof Error ? error.message : String(error),
          eventId,
          correlationId,
        });
        return NextResponse.json({ error: 'Timestamp verification failed' }, { status: 403 });
      }
    }

    const secret = source === 'razorpay'
      ? process.env.RAZORPAY_WEBHOOK_SECRET
      : process.env.TECBUNNY_WEBHOOK_SECRET;
    
    if (!validateWebhookSignature(signature, rawBody, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      logger.info('Duplicate order delayed webhook event received, skipping execution', { eventId, correlationId });
      return NextResponse.json({ success: true, message: 'Event already processed (duplicate)' }, { status: 200 });
    }

    const result = await processOrderDelayed(supabase, body, source);
    await logWebhookEvent(supabase, 'order_delayed', body, source, true, undefined, startTime, eventId);
    
    return NextResponse.json(result);

  } catch (error: any) {
    logger.error('Order delayed webhook error:', { error: error.message });
    
    try {
      const supabase = await createClient();
      await logWebhookEvent(
        supabase,
        'order_delayed',
        body,
        'unknown',
        false,
        error.message,
        startTime,
        body?.id || body?.event_id || body?.order_id || body?.order_number || null
      );
    } catch (logError: any) {
      logger.error('Failed to log webhook error:', { error: logError.message });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processOrderDelayed(supabase: any, data: any, source: string) {
  const {
    order_id,
    order_number,
    customer_phone,
    customer_name,
    tracking_number,
    delay_reason,
    original_delivery_date,
    new_delivery_date,
    estimated_delay_hours,
    delay_duration,
    compensation_offered,
    compensation_amount,
    apology_discount,
    tracking_url
  } = data;

  const orderId = order_id || order_number;
  const delayHours = estimated_delay_hours || delay_duration;

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const cleanPhone = customer_phone?.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`) : null;

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'delayed',
      delay_reason,
      original_delivery_date,
      new_delivery_date,
      estimated_delay_hours: delayHours,
      compensation_offered,
      compensation_amount,
      delayed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId);

  if (orderError) {
    logger.warn('Failed to update order status:', orderError);
  }

  // Task 4: AUTOMATED DELAY & MITIGATION OFFER MATRIX
  // Intercept delivery bottleneck and provision premium warranty if threshold met
  try {
    const CORPORATE_TIER_THRESHOLD = 10000; // INR 10k threshold
    const { data: orderMeta } = await supabase
      .from('orders')
      .select('total, customer_id')
      .eq('order_id', orderId)
      .single();

    if (orderMeta && orderMeta.total >= CORPORATE_TIER_THRESHOLD && orderMeta.customer_id) {
      const warrantyCoupon = `PREM-WARRANTY-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // 1. Provision premium warranty validation coupon into customer promotions
      const { error: promoError } = await supabase.rpc('add_customer_promotion_v1', {
        p_customer_id: orderMeta.customer_id,
        p_promotion_data: {
          type: 'premium_warranty',
          code: warrantyCoupon,
          label: 'Preemptive Delay Mitigation: 1-Year Extended Warranty',
          order_id: orderId,
          granted_at: new Date().toISOString()
        }
      });

      if (!promoError) {
        // 2. Inject mitigation alert into WhatsApp service layer
        const whatsapp = (await import('@tecbunny/core/server')).WhatsAppService;
        const ws = new whatsapp();
        
        await ws.sendMessage(formattedPhone!, {
          templateName: 'delay_mitigation_premium_1',
          templateData: {
            body: {
              placeholders: [customer_name || 'Valued Customer', orderId, warrantyCoupon]
            }
          },
          language: 'en_US'
        }, 'template', 'orderUpdates');
        
        logger.info('delay_mitigation_applied', { orderId, coupon: warrantyCoupon });
      }
    }
  } catch (mitigationError: any) {
    logger.error('delay_mitigation_failed', { error: mitigationError.message, orderId });
  }

  // Find customer and log interaction
  if (formattedPhone) {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', formattedPhone)
      .single();

    if (customer) {
      await supabase
        .from('customer_interactions')
        .insert({
          customer_id: customer.id,
          interaction_type: 'order_delayed',
          direction: 'outbound',
          interaction_data: {
            order_id: orderId,
            tracking_number,
            delay_reason,
            original_delivery_date,
            new_delivery_date,
            estimated_delay_hours: delayHours,
            compensation_offered,
            compensation_amount,
            source
          },
          created_at: new Date().toISOString()
        });
    }
  }

  // Send delay notification
  if (formattedPhone) {
    await sendOrderDelayedWhatsApp(formattedPhone, {
      orderId,
      customerName: customer_name,
      trackingNumber: tracking_number,
      delayReason: delay_reason,
      originalDeliveryDate: original_delivery_date,
      newDeliveryDate: new_delivery_date,
      estimatedDelayHours: delayHours,
      compensationOffered: compensation_offered,
      compensationAmount: compensation_amount,
      apologyDiscount: apology_discount,
      trackingUrl: tracking_url
    });
  }

  // Send urgent team notification
  if (process.env.TEAM_NOTIFICATION_ENABLED === 'true') {
    await sendTeamNotification('order_delayed', {
      order_id: orderId,
      customer_name,
      phone: formattedPhone,
      tracking_number,
      delay_reason,
      original_delivery_date,
      new_delivery_date,
      estimated_delay_hours: delayHours,
      compensation_offered,
      source
    });
  }

  return {
    success: true,
    order_id: orderId,
    phone: formattedPhone,
    delay_reason,
    new_delivery_date,
    estimated_delay_hours: delayHours,
    compensation_offered,
    source
  };
}

async function sendOrderDelayedWhatsApp(phoneNumber: string, orderData: any) {
  try {
    const originalDate = orderData.originalDeliveryDate 
      ? new Date(orderData.originalDeliveryDate).toLocaleDateString('en-IN')
      : 'scheduled date';
    
    const newDate = orderData.newDeliveryDate 
      ? new Date(orderData.newDeliveryDate).toLocaleDateString('en-IN')
      : 'updated soon';

    const delayInfo = orderData.estimatedDelayHours 
      ? `⏰ Estimated delay: ${orderData.estimatedDelayHours} hours`
      : '';

    const compensationInfo = orderData.compensationOffered || orderData.compensationAmount || orderData.apologyDiscount
      ? `\n💝 Apology Gift:\n${orderData.compensationAmount ? `₹${orderData.compensationAmount} credit added to your account` : 
          orderData.apologyDiscount ? `${orderData.apologyDiscount} discount on next order` : 
          'Special compensation for the inconvenience'}`
      : '';

    const message = `
⚠️ Delivery Update - TecBunny Store

${orderData.customerName ? `Hi ${orderData.customerName}, ` : ''}We sincerely apologize for the delay in your order delivery.

📦 Order: ${orderData.orderId}
${orderData.trackingNumber ? `📋 Tracking: ${orderData.trackingNumber}` : ''}

📅 Update:
• Original date: ${originalDate}
• New delivery date: ${newDate}
${delayInfo}

${orderData.delayReason ? `📝 Reason: ${orderData.delayReason}` : ''}

${compensationInfo}

🔧 What we're doing:
• Expediting your order processing
• Coordinating with delivery partners
• Monitoring progress closely
• Keeping you updated every step

${orderData.trackingUrl ? `🔍 Live tracking: ${orderData.trackingUrl}` : ''}

📞 Priority Support:
• Reply to this message for instant help
• Call +91 96041 36010 for urgent assistance
• WhatsApp updates every 6 hours

We truly appreciate your patience and apologize for any inconvenience caused. Your satisfaction is our priority! 🙏

- TecBunny Team
    `.trim();

    await sendWhatsAppNotification(phoneNumber, message);
    logger.info('Order delayed WhatsApp sent:', { 
      phoneNumber, 
      orderId: orderData.orderId,
      delayReason: orderData.delayReason,
      newDeliveryDate: orderData.newDeliveryDate
    });
  } catch (error: any) {
    logger.error('Failed to send order delayed WhatsApp:', { error: error.message });
  }
}

async function sendTeamNotification(type: string, data: any) {
  try {
    const teamNumbers = [
      process.env.TEAM_WHATSAPP_1,
      process.env.TEAM_WHATSAPP_2
    ].filter(Boolean);

    const message = `
🚨 URGENT: Order Delayed!

📦 Order: ${data.order_id}
👤 Customer: ${data.customer_name || 'N/A'}
📱 Phone: ${data.phone || 'N/A'}
🚚 Tracking: ${data.tracking_number || 'N/A'}
📝 Reason: ${data.delay_reason || 'Not specified'}
📅 Original date: ${data.original_delivery_date ? new Date(data.original_delivery_date).toLocaleDateString('en-IN') : 'N/A'}
📅 New date: ${data.new_delivery_date ? new Date(data.new_delivery_date).toLocaleDateString('en-IN') : 'TBD'}
⏰ Delay: ${data.estimated_delay_hours ? `${data.estimated_delay_hours} hours` : 'Unknown'}
💰 Compensation: ${data.compensation_offered ? 'Yes' : 'No'}
🔗 Source: ${data.source}

Time: ${new Date().toLocaleString('en-IN')}

IMMEDIATE ACTIONS REQUIRED:
1. Contact customer for personal apology ☎️
2. Expedite delivery process 🚀
3. Prepare compensation if needed 💝
4. Update customer every 6 hours 📱
5. Escalate to manager if needed 👔
    `.trim();

    for (const number of teamNumbers) {
      if (number) {
        await sendWhatsAppNotification(number, message);
      }
    }
  } catch (error: any) {
    logger.error('Failed to send team notification:', { error: error.message });
  }
}


