import { NextRequest, NextResponse, after } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/whatsapp-service';
import { logger } from '@/lib/logger';
import { getRedis } from '@/lib/redis';

// Initialize Stripe Client with API Version locking for stability
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-11' as any,
});

// Retrieve the Webhook secret from environment variables (checking multiple aliases for safety)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || process.env.PROCESS_ENV_WEBHOOK_SECRET;

/**
 * Next.js Config: Force Node.js runtime and disable static generation
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  let rawBody = '';

  try {
    rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('stripe.webhook.missing_signature', { correlationId });
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    if (!webhookSecret) {
      logger.error('stripe.webhook.missing_signing_secret', { correlationId });
      return NextResponse.json({ error: 'Signing secret not configured' }, { status: 500 });
    }

    // Cryptographic signature check
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    logger.info('stripe.webhook.signature_verified', { eventId: event.id, eventType: event.type, correlationId });

    // Use Next.js 15+ after() to execute background operations asynchronously and prevent gateway timeouts
    after(async () => {
      try {
        await handleWebhookPayloadAsync(event, correlationId);
      } catch (err: any) {
        logger.error('stripe.webhook.background_processing_failed', { correlationId, error: err.message });
      }
    });

    return NextResponse.json({ success: true, message: 'Webhook event received' }, { status: 200 });

  } catch (error: any) {
    logger.error('stripe.webhook.error', { correlationId, error: error.message });
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 400 }
    );
  }
}

/**
 * Asynchronous Event Dispatcher
 * Processes the event type and executes database transactions.
 */
async function handleWebhookPayloadAsync(event: Stripe.Event, correlationId: string) {
  const supabase = await createClient();
  const dataObject = event.data.object;

  // 1. Idempotency Check: database check
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existingEvent) {
    logger.info('stripe.webhook.duplicate_event_db', { eventId: event.id, correlationId });
    return;
  }

  // 2. Idempotency Check: Redis check
  const redis = getRedis();
  if (redis) {
    const idempotencyKey = `webhook:stripe:${event.id}`;
    const isNewEvent = await redis.set(idempotencyKey, 'processing', 'EX', 86400, 'NX');
    if (!isNewEvent) {
      logger.info('stripe.webhook.duplicate_event_redis', { eventId: event.id, correlationId });
      return;
    }
  }

  try {
    const eventType = event.type;
    let processed = false;
    let errorMessage: string | undefined;

    if (eventType === 'payment_intent.succeeded' || eventType === 'payment_intent.payment_failed') {
      const paymentIntent = dataObject as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId || paymentIntent.metadata.order_id || paymentIntent.metadata.order_number;

      if (!orderId) {
        throw new Error('Missing orderId in Stripe metadata');
      }

      // Retrieve existing order
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (fetchError || !order) {
        throw new Error(`Order ${orderId} not found in database`);
      }

      const paymentStatus = eventType === 'payment_intent.succeeded' ? 'approved' : 'failed';
      const orderStatus = paymentStatus === 'approved' ? 'Payment Confirmed' : 'Payment Failed';

      // Update Order Table
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_id: paymentIntent.id,
          payment_method: paymentIntent.payment_method_types?.[0] || 'stripe',
          payment_date: new Date().toISOString(),
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (orderError) {
        logger.error('stripe.webhook.order_update_failed', { orderId, orderError });
        throw orderError;
      }

      // Insert Payments Table row
      const paymentAmount = paymentIntent.amount / 100;
      const cleanPhone = order.customer_phone?.replace(/[^\d]/g, '');
      const formattedPhone = cleanPhone ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`) : null;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          payment_id: paymentIntent.id,
          order_id: orderId,
          customer_phone: formattedPhone,
          amount: paymentAmount,
          currency: paymentIntent.currency.toUpperCase(),
          payment_method: paymentIntent.payment_method_types?.[0] || 'stripe',
          status: paymentStatus,
          gateway_response: paymentIntent,
          source: 'stripe',
          metadata: paymentIntent.metadata,
          created_at: new Date().toISOString()
        });

      if (paymentError && paymentError.code !== '23505') {
        logger.error('stripe.webhook.payment_insert_failed', { paymentError });
        throw paymentError;
      }

      // Insert Interaction Log
      if (formattedPhone && order.customer_id) {
        await supabase
          .from('customer_interactions')
          .insert({
            customer_id: order.customer_id,
            interaction_type: 'payment_received',
            direction: 'inbound',
            interaction_data: {
              payment_id: paymentIntent.id,
              order_id: orderId,
              amount: paymentAmount,
              currency: paymentIntent.currency.toUpperCase(),
              payment_method: 'stripe',
              source: 'stripe'
            },
            created_at: new Date().toISOString()
          });
      }

      // Send WhatsApp notifications on successful payment
      if (paymentStatus === 'approved' && formattedPhone) {
        await sendPaymentConfirmationWhatsApp(formattedPhone, {
          paymentId: paymentIntent.id,
          orderId,
          amount: paymentAmount,
          currency: paymentIntent.currency.toUpperCase(),
          customerName: order.customer_name,
          paymentMethod: 'stripe'
        });

        if (process.env.TEAM_NOTIFICATION_ENABLED === 'true') {
          await sendTeamNotification('payment_received', {
            payment_id: paymentIntent.id,
            order_id: orderId,
            customer_name: order.customer_name,
            phone: formattedPhone,
            amount: paymentAmount,
            currency: paymentIntent.currency.toUpperCase(),
            payment_method: 'stripe',
            source: 'stripe'
          });
        }
      }

      processed = true;
    }

    // Save final status in webhook event logs
    await supabase
      .from('webhook_events')
      .insert({
        source: 'stripe',
        event_type: event.type,
        payload: event,
        processed,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
        event_id: event.id
      });

  } catch (error: any) {
    logger.error('stripe.webhook.processing_error', { correlationId, error: error.message });
    
    // Log failed webhook status for audit trail
    try {
      await supabase
        .from('webhook_events')
        .insert({
          source: 'stripe',
          event_type: event.type,
          payload: event,
          processed: false,
          error_message: error.message,
          created_at: new Date().toISOString(),
          event_id: event.id
        });
    } catch (logError: any) {
      logger.error('stripe.webhook.failed_to_log_error', { logError });
    }
  }
}

async function sendPaymentConfirmationWhatsApp(phoneNumber: string, paymentData: any) {
  try {
    const message = `
✅ Payment Confirmed - TecBunny Store

💳 Payment ID: ${paymentData.paymentId}
📦 Order: ${paymentData.orderId || 'N/A'}
💰 Amount: ${paymentData.currency} ${paymentData.amount?.toLocaleString('en-IN')}
💳 Method: ${paymentData.paymentMethod || 'N/A'}

${paymentData.customerName ? `Hi ${paymentData.customerName}! ` : ''}Your payment has been successfully processed! 🎉

📦 Your order is now confirmed and will be processed within 24 hours.
📱 Track your order: https://www.tecbunny.com/orders/${paymentData.orderId || ''}

Thank you for shopping with TecBunny! 🚀
    `.trim();

    await sendWhatsAppNotification(phoneNumber, message);
    logger.info('Payment confirmation WhatsApp sent:', { 
      phoneNumber, 
      paymentId: paymentData.paymentId 
    });
  } catch (error: any) {
    logger.error('Failed to send payment confirmation WhatsApp:', { error: error.message });
  }
}

async function sendTeamNotification(type: string, data: any) {
  try {
    const teamNumbers = [
      process.env.TEAM_WHATSAPP_1,
      process.env.TEAM_WHATSAPP_2
    ].filter(Boolean);

    const message = `
💰 Payment Received!

💳 Payment: ${data.payment_id}
📦 Order: ${data.order_id || 'N/A'}
👤 Customer: ${data.customer_name || 'N/A'}
📱 Phone: ${data.phone || 'N/A'}
💰 Amount: ${data.currency} ${data.amount?.toLocaleString('en-IN')}
💳 Method: ${data.payment_method || 'N/A'}
🔗 Source: ${data.source}

Time: ${new Date().toLocaleString('en-IN')}
Action: Process order for fulfillment! 📦
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
