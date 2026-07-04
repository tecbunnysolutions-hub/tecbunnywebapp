import { NextRequest, NextResponse } from 'next/server';

import { sendWhatsAppNotification } from '@/lib/whatsapp-service';
import { createClient } from '@/lib/supabase/server';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';

// Handle incoming Infobip WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const token = request.nextUrl.searchParams.get('token');
    
    // Optional: Simple token verification if configured in Infobip Webhook URL (e.g. ?token=mysecret)
    if (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && token !== process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      logger.warn('Unauthorized Infobip webhook blocked');
      return new Response('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(rawBody);
    
    // Idempotency: Check if these messages have already been processed
    const redis = getRedis();
    const messageIds: string[] = [];
    
    // Infobip payload parsing
    const results = body.results || [];
    for (const result of results) {
      if (result.messageId) {
        messageIds.push(result.messageId);
      }
    }

    if (redis && messageIds.length > 0) {
      const claimResults = await Promise.all(
        messageIds.map(id => redis.set(`webhook:infobip:msg:${id}`, 'processing', 'EX', 86400, 'NX'))
      );
      const claimedMessageIds = new Set(
        messageIds.filter((_, index) => claimResults[index])
      );

      if (claimedMessageIds.size === 0) {
        logger.info('Duplicate Infobip webhook event, skipping execution', { messageIds });
        return NextResponse.json({ status: 'already_processed' });
      }
      body.__claimedMessageIds = claimedMessageIds;
    } else if (messageIds.length > 0) {
      body.__claimedMessageIds = new Set(messageIds);
    }

    const supabase = await createClient();
    const claimedMessageIds: Set<string> | undefined = body.__claimedMessageIds;

    // Process Infobip webhook events
    await processInfobipMessages(supabase, results, claimedMessageIds);

    if (redis && claimedMessageIds?.size) {
      await Promise.all(
        [...claimedMessageIds].map(id => redis.set(`webhook:infobip:msg:${id}`, 'processed', 'EX', 86400))
      );
    }

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('Infobip webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processInfobipMessages(supabase: any, results: any[], claimedMessageIds?: Set<string>) {
  for (const result of results) {
    const phoneNumber = result.from;
    const messageId = result.messageId;
    const timestamp = result.receivedAt ? new Date(result.receivedAt) : new Date();

    if (!messageId || (claimedMessageIds && !claimedMessageIds.has(messageId))) {
      continue;
    }

    const { data: existingMessage, error: existingMessageError } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .eq('whatsapp_message_id', messageId)
      .maybeSingle();

    if (existingMessageError) {
      logger.warn('Failed to check WhatsApp message idempotency', { error: existingMessageError, messageId });
    }

    if (existingMessage) {
      logger.info('Duplicate WhatsApp message skipped from database idempotency check', { messageId });
      continue;
    }

    // Find or create customer
    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (!customer) {
      const contactName = result.contact?.name || `Customer ${phoneNumber.slice(-4)}`;
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          phone: phoneNumber,
          name: contactName,
          lead_source: 'whatsapp',
          first_contact_date: timestamp,
          status: 'new_lead'
        })
        .select()
        .single();
      
      customer = newCustomer;
    }

    // Log the message
    await supabase
      .from('whatsapp_messages')
      .insert({
        customer_id: customer.id,
        phone_number: phoneNumber,
        message_type: result.message?.type?.toLowerCase() || 'unknown',
        direction: 'inbound',
        content: getMessageContent(result.message),
        whatsapp_message_id: messageId,
        message_status: 'received',
        created_at: timestamp
      });

    // Log interaction
    await supabase
      .from('customer_interactions')
      .insert({
        customer_id: customer.id,
        interaction_type: 'whatsapp_message',
        direction: 'inbound',
        interaction_data: {
          message_type: result.message?.type?.toLowerCase() || 'unknown',
          content: getMessageContent(result.message),
          message_id: messageId
        },
        created_at: timestamp
      });

    // Process automated responses
    await handleAutomatedResponse(customer, result.message);
  }
}

function getMessageContent(message: any): string {
  if (!message) return '';
  const type = message.type?.toLowerCase();
  
  switch (type) {
    case 'text':
      return message.text || '';
    case 'image':
      return message.caption || '[Image]';
    case 'document':
      return message.url ? `[Document: ${message.url}]` : '[Document]';
    case 'audio':
      return '[Audio message]';
    case 'video':
      return message.caption || '[Video]';
    default:
      return `[${type}]`;
  }
}

async function handleAutomatedResponse(customer: any, message: any) {
  if (message?.type?.toLowerCase() !== 'text') return;

  const content = message.text?.toLowerCase() || '';
  
  // Business hours check
  const now = new Date();
  const hour = now.getHours();
  const isBusinessHours = hour >= 9 && hour < 19;

  if (!isBusinessHours) {
    await sendWhatsAppNotification(customer.phone, `
🌙 Thank you for contacting TecBunny Store!

Our team is currently offline. Business hours:
🕘 9:00 AM - 7:00 PM IST (Mon-Sat)

We'll respond to your message first thing tomorrow morning.

For urgent support, visit: https://tecbunny.com/contact
    `.trim());
    return;
  }

  // Keyword-based responses
  if (content.includes('hi') || content.includes('hello') || content.includes('hey')) {
    await sendWhatsAppNotification(customer.phone, `
👋 Hello! Welcome to TecBunny Store!

How can we help you today?

🛍️ Browse products: https://tecbunny.com
📞 Call us: +91 96041 36010
💬 Or just tell us what you're looking for!
    `.trim());
  } else if (content.includes('price') || content.includes('cost')) {
    await sendProductPricing(customer.phone);
  } else if (content.includes('order') || content.includes('track')) {
    await sendOrderHelp(customer.phone);
  } else if (content.includes('return') || content.includes('refund')) {
    await sendReturnPolicy(customer.phone);
  }
}

async function sendProductPricing(phoneNumber: string) {
  await sendWhatsAppNotification(phoneNumber, `
💰 TecBunny Pricing Guide

🎮 Gaming Peripherals:
• Mechanical Keyboards: ₹3,299 - ₹3,999
• Gaming Mice: ₹1,499 - ₹2,399  
• Gaming Headsets: ₹2,499 - ₹2,999

💻 Computer Accessories:
• Wireless Keyboards: ₹2,699 - ₹3,199
• Wireless Mice: ₹999 - ₹1,799
• USB-C Cables: ₹599 - ₹999

📱 View detailed specs: https://tecbunny.com/products

Need a specific quote? Just ask! 😊
  `.trim());
}

async function sendOrderHelp(phoneNumber: string) {
  await sendWhatsAppNotification(phoneNumber, `
📦 Order & Tracking Help

To check your order:
1️⃣ Visit: https://tecbunny.com/orders
2️⃣ Enter your order number
3️⃣ Or share your order number here

📱 WhatsApp tracking updates
📧 Email confirmations sent
🚚 Free shipping on orders above ₹1,000

Need help? Share your order number! 👍
  `.trim());
}

async function sendReturnPolicy(phoneNumber: string) {
  await sendWhatsAppNotification(phoneNumber, `
🔄 TecBunny Return Policy

✅ 5-day return window
📱 Video unboxing required for returns
💯 100% refund for defective items
📦 Free return pickup

Return process:
1️⃣ Contact us within 5 days
2️⃣ Share video unboxing proof
3️⃣ We arrange pickup
4️⃣ Refund processed within 7 days

Full policy: https://tecbunny.com/returns

Questions? We're here to help! 😊
  `.trim());
}
