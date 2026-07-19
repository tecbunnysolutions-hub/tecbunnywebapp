import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';


import { sendWhatsAppNotification, sendShipmentNotification } from "@tecbunny/core/whatsapp-service";
import { logger } from "@tecbunny/core";
import { logWebhookEvent } from "@tecbunny/core/webhook-logger";

const deriveWebhookEventId = (source: string, rawBody: string, signature: string | null): string => crypto
  .createHash('sha256')
  .update(source)
  .update('\0')
  .update(signature ?? '')
  .update('\0')
  .update(rawBody)
  .digest('hex');

// Generic order shipped webhook handler
export async function POST(request: NextRequest) {
  let body: any = {};
  const correlationId = request.headers.get('x-correlation-id') || null;
  const startTime = new Date();

  try {
    const supabase = await createClient();
    const rawBody = await request.text();
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      logger.error('Failed to parse webhook body', { error: e });
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const source = request.headers.get('x-webhook-source') || 'unknown';
    const eventId = body.id || body.event_id || body.order_id || body.order_number || request.headers.get('x-webhook-id') || deriveWebhookEventId(source, rawBody, signature);

    logger.info('Order shipped webhook received', { source, eventId, correlationId });
    
    if (!validateWebhookSignature(signature, timestamp, rawBody, source)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      logger.info('Duplicate order shipped webhook event received, skipping execution', { eventId, correlationId });
      return NextResponse.json({ success: true, message: 'Event already processed (duplicate)' }, { status: 200 });
    }

    const result = await processOrderShipped(supabase, body, source);
    await logWebhookEvent(supabase, 'order_shipped', body, source, true, undefined, startTime, eventId);
    
    return NextResponse.json(result);

  } catch (error: any) {
    logger.error('Order shipped webhook error:', { error: error.message });
    
    try {
      const supabase = await createClient();
      await logWebhookEvent(
        supabase,
        'order_shipped',
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

async function processOrderShipped(supabase: any, data: any, source: string) {
  const {
    order_id,
    order_number,
    customer_phone,
    customer_name,
    tracking_number,
    carrier,
    courier_name,
    shipping_address,
    estimated_delivery,
    expected_delivery_date,
    tracking_url
  } = data;

  const orderId = order_id || order_number;
  const courierService = carrier || courier_name;

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const cleanPhone = customer_phone?.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`) : null;
  const deliveryDate = estimated_delivery || expected_delivery_date;

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number,
      carrier: courierService,
      shipped_at: new Date().toISOString(),
      estimated_delivery: deliveryDate,
      tracking_url,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId);

  if (orderError) {
    logger.warn('Failed to update order status:', orderError);
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
          interaction_type: 'order_shipped',
          direction: 'outbound',
          interaction_data: {
            order_id: orderId,
            tracking_number,
            carrier: courierService,
            estimated_delivery: deliveryDate,
            tracking_url,
            source
          },
          created_at: new Date().toISOString()
        });
    }
  }

  // Send shipping notification
  if (formattedPhone) {
    await sendOrderShippedWhatsApp(formattedPhone, {
      orderId,
      customerName: customer_name,
      trackingNumber: tracking_number,
      carrier: courierService,
      estimatedDelivery: deliveryDate,
      trackingUrl: tracking_url,
      shippingAddress: shipping_address
    });
  }

  // Send team notification
  if (process.env.TEAM_NOTIFICATION_ENABLED === 'true') {
    await sendTeamNotification('order_shipped', {
      order_id: orderId,
      customer_name,
      phone: formattedPhone,
      tracking_number,
      carrier: courierService,
      estimated_delivery: deliveryDate,
      source
    });
  }

  return {
    success: true,
    order_id: orderId,
    phone: formattedPhone,
    tracking_number,
    carrier: courierService,
    estimated_delivery: deliveryDate,
    source
  };
}

async function sendOrderShippedWhatsApp(phoneNumber: string, orderData: any) {
  try {
    const estimatedDelivery = orderData.estimatedDelivery 
      ? new Date(orderData.estimatedDelivery).toLocaleDateString('en-IN')
      : 'Soon';

    await sendShipmentNotification(phoneNumber, {
      orderNumber: orderData.orderId,
      customerName: orderData.customerName,
      carrier: orderData.carrier || 'Courier',
      trackingNumber: orderData.trackingNumber || 'Pending'
    });

    logger.info('Order shipped WhatsApp sent (Template):', { 
      phoneNumber, 
      orderId: orderData.orderId,
      estimatedDelivery 
    });
  } catch (error: any) {
    logger.error('Failed to send order shipped WhatsApp:', { error: error.message });
  }
}

async function sendTeamNotification(type: string, data: any) {
  try {
    const teamNumbers = [
      process.env.TEAM_WHATSAPP_1,
      process.env.TEAM_WHATSAPP_2
    ].filter(Boolean);

    const message = `
📦 Order Shipped Update!

📦 Order: ${data.order_id}
👤 Customer: ${data.customer_name || 'N/A'}
📱 Phone: ${data.phone || 'N/A'}
🚚 Tracking: ${data.tracking_number || 'N/A'}
🏢 Carrier: ${data.carrier || 'N/A'}
📅 Expected delivery: ${data.estimated_delivery ? new Date(data.estimated_delivery).toLocaleDateString('en-IN') : 'TBD'}
🔗 Source: ${data.source}

Time: ${new Date().toLocaleString('en-IN')}
Status: Package is in transit! 🚚
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

function validateWebhookSignature(
  signature: string | null,
  timestamp: string | null,
  rawBody: string,
  source: string
): boolean {
  const secret = process.env.ORDER_SHIPPED_WEBHOOK_SECRET || process.env.SHIPPING_WEBHOOK_SECRET || process.env.WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Order shipped webhook signature skipped in development because no secret is configured', { source });
      return true;
    }

    logger.error('Order shipped webhook secret is not configured', { source });
    return false;
  }

  if (!signature) {
    logger.warn('No webhook signature provided', { source });
    return false;
  }

  if (timestamp) {
    const timestampMs = Number(timestamp) * (timestamp.length === 10 ? 1000 : 1);
    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
      logger.warn('Stale or invalid webhook timestamp', { source });
      return false;
    }
  }

  const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  const received = signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature;

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    logger.warn('Invalid webhook signature length', { source });
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}


