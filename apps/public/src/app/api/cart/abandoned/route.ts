import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendWhatsAppNotification } from '@/lib/whatsapp-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, cartItems, amount } = body;

    if (!phone || !cartItems || cartItems.length === 0 || !amount) {
      return NextResponse.json({ success: false, error: 'Missing phone, cart items, or amount.' }, { status: 400 });
    }

    const formattedPhone = phone.replace(/\D/g, '');
    const cleanName = name?.trim() || 'Valued Customer';
    
    // Build Indian UPI Payment Deep-Link
    // pa: Payee VPA, pn: Payee Name, am: Amount, cu: Currency, tn: Transaction Note
    const payeeVpa = '30AAMCT1608G1ZO@payu';
    const payeeName = 'TecBunny Solutions Private Limited';
    const transactionNote = 'TecBunny Checkout Recovery';
    
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Build premium conversational recovery template message
    const itemLines = cartItems.map((item: any) => `• ${item.name || item.title} (x${item.quantity || 1})`).join('\n');
    
    const whatsappMessage = `🛒 *TecBunny Solutions: Complete Your Purchase*

Hi ${cleanName}, we noticed you left items in your cart. We have reserved them for you:

*Items waiting for you:*
${itemLines}

*Total Invoice Amount:* ₹${Number(amount).toLocaleString('en-IN')}

*⚡ Instant UPI Checkout:*
Click the link below to pay instantly via GooglePay, PhonePe, or PayTM:
${upiDeepLink}

_Need configuration help or custom changes? Just reply to this message! 💬_`.trim();

    logger.info('b2c_cart_abandonment_logged', { phone: formattedPhone, name: cleanName, amount });

    // Attempt sending real message (fails silently if WhatsApp provider is unconfigured)
    let messageSent = false;
    try {
      await sendWhatsAppNotification(formattedPhone, whatsappMessage);
      messageSent = true;
    } catch (err) {
      logger.warn('whatsapp_abandonment_notification_skipped', { error: (err as any).message });
    }

    return NextResponse.json({
      success: true,
      messageSent,
      upiDeepLink,
      whatsappMessage,
      recoveryPayload: {
        phone: formattedPhone,
        name: cleanName,
        amount
      }
    });

  } catch (error: any) {
    logger.error('uncaught_error_in_cart_abandoned_api', { error: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
