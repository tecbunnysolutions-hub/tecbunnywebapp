import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { getTrustedClientIp } from '@tecbunny/core/server';
import { sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';

const recoveryRequestSchema = z.object({
  consent: z.literal(true),
  name: z.string().trim().max(100).optional().default(''),
  phone: z.string().trim().regex(/^\d{10,12}$/),
  items: z.array(z.object({
    id: z.string().trim().min(1).max(200),
    quantity: z.number().int().min(1).max(100),
  }).strict()).min(1).max(25),
  website: z.string().max(200).optional().default(''),
}).strict();

export async function POST(request: NextRequest) {
  const ip = getTrustedClientIp(request);
  const ipLimit = await rateLimit(`cart-recovery:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = recoveryRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Please provide valid consent and a phone number.' }, { status: 400 });
    }

    if (parsed.data.website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const { phone } = parsed.data;
    const { createSupabaseClient } = await import('@tecbunny/database/server');
    const authClient = await createSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    const verifiedPhone = user?.phone?.replace(/\D/g, '') || '';
    const requestedPhone = phone.length === 10 ? `91${phone}` : phone;
    const normalizedVerifiedPhone = verifiedPhone.length === 10 ? `91${verifiedPhone}` : verifiedPhone;
    if (!user || !user.phone_confirmed_at) {
      return NextResponse.json({ success: false, error: 'Sign in with a phone-verified account to send a WhatsApp cart link.' }, { status: 401 });
    }
    if (!normalizedVerifiedPhone || normalizedVerifiedPhone !== requestedPhone) {
      return NextResponse.json({ success: false, error: 'Use the phone number verified on your account.' }, { status: 403 });
    }

    const phoneLimit = await rateLimit(`cart-recovery:phone:${phone}`, 1, 60 * 60 * 1000);
    if (!phoneLimit.allowed) {
      return NextResponse.json({ success: false, error: 'A WhatsApp cart link was already requested for this number recently.' }, { status: 429 });
    }

    const cartItems = Buffer.from(JSON.stringify(parsed.data.items)).toString('base64url');
    const cartUrl = `https://tecbunny.com/cart?recover=${encodeURIComponent(cartItems)}`;
    const name = parsed.data.name.replace(/[\r\n]/g, ' ').trim() || 'there';
    const message = `Hi ${name}, you asked us to send this WhatsApp link to your TecBunny cart: ${cartUrl}\n\nItems are not reserved, and prices and availability are confirmed at checkout. No payment is due through this message.`;

    await sendWhatsAppNotification(phone, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('cart_recovery_whatsapp_send_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false, error: 'Unable to send the WhatsApp cart link right now.' }, { status: 502 });
  }
}
