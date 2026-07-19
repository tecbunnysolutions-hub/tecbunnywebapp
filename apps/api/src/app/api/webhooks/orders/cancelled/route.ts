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

// Generic order cancelled webhook handler
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
      logger.error('Failed to parse order cancelled webhook body', { error });
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const signature = request.headers.get('x-webhook-signature');
    const source = request.headers.get('x-webhook-source') || 'unknown';
    const timestampStr = request.headers.get('x-webhook-timestamp');
    const eventId = body.id || body.event_id || body.order_id || body.order_number || deriveWebhookEventId(source, rawBody, signature);

    logger.info('Order cancelled webhook received', { source, eventId, correlationId });

    if (timestampStr) {
      try {
        validateWebhookTimestamp(Number(timestampStr));
      } catch (error) {
        logger.error('Order cancelled webhook timestamp validation failed', {
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
      logger.info('Duplicate order cancelled webhook event received, skipping execution', { eventId, correlationId });
      return NextResponse.json({ success: true, message: 'Event already processed (duplicate)' }, { status: 200 });
    }

    const result = await processOrderCancelled(supabase, body, source);
    await logWebhookEvent(supabase, 'order_cancelled', body, source, true, undefined, startTime, eventId);
    
    return NextResponse.json(result);

  } catch (error: any) {
    logger.error('Order cancelled webhook error:', { error: error.message });
    
    try {
      const supabase = await createClient();
      await logWebhookEvent(
        supabase,
        'order_cancelled',
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

async function processOrderCancelled(supabase: any, data: any, source: string) {
  const {
    order_id,
    order_number,
    customer_phone,
    customer_name,
    cancellation_reason,
    cancelled_by,
    refund_amount,
    refund_status,
    currency = 'INR',
    cancelled_at,
    metadata,
    ...additionalData
  } = data;

  const orderId = order_id || order_number;

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const cleanPhone = customer_phone?.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`) : null;

  // Update order status
  const { data: updatedOrder, error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancellation_reason,
      cancelled_by,
      cancelled_at: cancelled_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (orderError) {
    logger.warn('Failed to update order status:', orderError);
  }

  // Create cancellation record
  const { error: cancellationError } = await supabase
    .from('order_cancellations')
    .insert({
      order_id: orderId,
      customer_phone: formattedPhone,
      cancellation_reason,
      cancelled_by,
      refund_amount,
      refund_status,
      source,
      metadata: {
        ...metadata,
        ...additionalData
      },
      created_at: cancelled_at || new Date().toISOString()
    });

  if (cancellationError && cancellationError.code !== '23505') {
    logger.warn('Failed to create cancellation record:', cancellationError);
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
          interaction_type: 'order_cancelled',
          direction: 'system',
          interaction_data: {
            order_id: orderId,
            cancellation_reason,
            cancelled_by,
            refund_amount,
            refund_status,
            source
          },
          created_at: new Date().toISOString()
        });
    }
  }

  // Send cancellation notification
  if (formattedPhone) {
    await sendOrderCancellationWhatsApp(formattedPhone, {
      orderId,
      customerName: customer_name,
      cancellationReason: cancellation_reason,
      cancelledBy: cancelled_by,
      refundAmount: refund_amount,
      refundStatus: refund_status,
      currency,
      orderData: updatedOrder
    });
  }

  // Send team notification
  if (process.env.TEAM_NOTIFICATION_ENABLED === 'true') {
    await sendTeamNotification('order_cancelled', {
      order_id: orderId,
      customer_name,
      phone: formattedPhone,
      cancellation_reason,
      cancelled_by,
      refund_amount,
      currency,
      source
    });
  }

  return {
    success: true,
    order_id: orderId,
    phone: formattedPhone,
    cancellation_reason,
    cancelled_by,
    refund_amount,
    source
  };
}

async function sendOrderCancellationWhatsApp(phoneNumber: string, cancellationData: any) {
  try {
    let message = `
❌ Order Cancelled - TecBunny Store

📦 Order: ${cancellationData.orderId}
${cancellationData.customerName ? `Hi ${cancellationData.customerName}, ` : ''}

Your order has been cancelled.

${cancellationData.cancellationReason ? `📝 Reason: ${cancellationData.cancellationReason}` : ''}
${cancellationData.cancelledBy ? `👤 Cancelled by: ${cancellationData.cancelledBy}` : ''}
    `;

    if (cancellationData.refundAmount && cancellationData.refundAmount > 0) {
      message += `
      
💰 Refund Information:
Amount: ${cancellationData.currency} ${cancellationData.refundAmount.toLocaleString('en-IN')}
Status: ${cancellationData.refundStatus || 'Processing'}

${cancellationData.refundStatus === 'processing' || !cancellationData.refundStatus ? 
  '⏱️ Your refund will be processed within 5-7 business days.' : 
  '✅ Refund has been processed.'}`;
    }

    message += `

🛍️ Shop again: https://tecbunny.com
❓ Questions? Reply to this message or call +91 96041 36010

We appreciate your understanding! 🙏`;

    await sendWhatsAppNotification(phoneNumber, message.trim());
    logger.info('Order cancellation WhatsApp sent:', { 
      phoneNumber, 
      orderId: cancellationData.orderId 
    });
  } catch (error: any) {
    logger.error('Failed to send order cancellation WhatsApp:', { error: error.message });
  }
}

async function sendTeamNotification(type: string, data: any) {
  try {
    const teamNumbers = [
      process.env.TEAM_WHATSAPP_1,
      process.env.TEAM_WHATSAPP_2
    ].filter(Boolean);

    const message = `
🚫 Order Cancelled Alert!

📦 Order: ${data.order_id}
👤 Customer: ${data.customer_name || 'N/A'}
📱 Phone: ${data.phone || 'N/A'}
📝 Reason: ${data.cancellation_reason || 'Not specified'}
👤 Cancelled by: ${data.cancelled_by || 'System'}
${data.refund_amount ? `💰 Refund: ${data.currency} ${data.refund_amount.toLocaleString('en-IN')}` : ''}
🔗 Source: ${data.source}

Time: ${new Date().toLocaleString('en-IN')}
Action: ${data.refund_amount ? 'Process refund if applicable' : 'Review cancellation'} 🔍
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


