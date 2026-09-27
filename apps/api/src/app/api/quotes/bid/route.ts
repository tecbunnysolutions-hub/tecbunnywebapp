import { createSupabaseServiceClient } from "@tecbunny/core/server";
import {  createSupabaseClient as createServerClient  } from '@tecbunny/database/server';
import { NextResponse } from 'next/server';

import { logger } from "@tecbunny/core/logger";
import { sendWhatsAppNotification } from "@tecbunny/core/whatsapp-service";
import { createQuoteActionToken, verifyQuoteActionToken } from "@tecbunny/core/quotes/action-token";
import { rateLimit } from "@tecbunny/core/rate-limit";
import { getTrustedClientIp } from "@tecbunny/core/request-ip";
import { randomInt } from 'crypto';

import { z } from 'zod';

const bidSchema = z.object({
  quoteId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(10, 'Invalid phone'),
  address: z.string().optional().nullable(),
  biddedPrice: z.number().positive('Bid must be strictly greater than 0'),
  summary: z.string().max(1000).optional().nullable(),
  customSetupConfig: z.any().optional().nullable(),
  actionToken: z.string().max(2048).optional().nullable(),
});

function quoteTotal(value: any): number {
  const total = Number(value?.totals?.overall?.sale ?? value?.totals?.sale ?? value?.totals?.overall ?? 0);
  return Number.isFinite(total) ? total : 0;
}

export async function POST(req: Request) {
  try {
    // Bids notify staff over WhatsApp; bound anonymous submissions.
    const limit = await rateLimit(`quote_bid:${getTrustedClientIp(req)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many bids. Please try again later.' }, { status: 429 });
    }

    const supabase = await createServerClient();
    // getUser() validates the session with Supabase; getSession() data is not trusted.
    const { data: { user } } = await supabase.auth.getUser();
    const serviceClient = createSupabaseServiceClient();
    
    const json = await req.json();
    const validatedData = bidSchema.parse(json);
    const { quoteId, name, email, phone, address, biddedPrice, summary, customSetupConfig, actionToken } = validatedData;

    // Validate: bid price must be at least 70% of quoted price
    const originalPrice = quoteTotal(customSetupConfig);
    const minBidPrice = originalPrice * 0.7; // 70% minimum

    if (originalPrice > 0 && biddedPrice < minBidPrice) {
      return NextResponse.json({ 
        error: `Bid price must be at least ₹${Math.round(minBidPrice).toLocaleString()} (70% of quoted price)` 
      }, { status: 400 });
    }

    let finalQuoteId = quoteId;
    let finalQuoteNumber = '';

    // If no quoteId exists yet, create one
    if (!finalQuoteId) {
      const formattedSelections = {
        type: 'customised_setup',
        ...customSetupConfig,
        totals: customSetupConfig?.totals?.overall || customSetupConfig?.totals || {}
      };

      const quoteNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${randomInt(10000, 100000)}`;

      const { data, error } = await serviceClient.from('quotes').insert({
        user_id: user?.id || null,
        customer_name: name,
        customer_email: email || 'anonymous@tecbunny.com',
        customer_phone: phone,
        customer_address: address,
        bidded_price: biddedPrice,
        summary: summary,
        selections: formattedSelections,
        status: 'bidded',
        quote_number: quoteNumber,
        expiry_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }).select('id, quote_number').single();

      if (error) throw error;
      finalQuoteId = data.id;
      finalQuoteNumber = data.quote_number;
    } else {
      // OCC / State-Machine validation
      const { data: existingQuote, error: checkError } = await serviceClient
        .from('quotes')
        .select('status, user_id, selections')
        .eq('id', finalQuoteId)
        .single();
      
      if (checkError) throw checkError;

      // Only the quote's owner or a holder of its customer link may revise it.
      const ownsQuote = Boolean(user && existingQuote.user_id && existingQuote.user_id === user.id);
      if (!ownsQuote && !verifyQuoteActionToken(actionToken, finalQuoteId, ['quote_customer'])) {
        return NextResponse.json({ error: 'Secure quote link is missing or expired' }, { status: 403 });
      }

      // Enforce the floor against the stored quote, not client-supplied totals.
      const storedTotal = quoteTotal(existingQuote.selections);
      if (storedTotal > 0 && biddedPrice < storedTotal * 0.7) {
        return NextResponse.json({
          error: `Bid price must be at least ₹${Math.round(storedTotal * 0.7).toLocaleString()} (70% of quoted price)`
        }, { status: 400 });
      }
      
      // Explicit state lock to prevent stale updates or bypassing accepted contracts
      if (!['created', 'bidded'].includes(existingQuote.status)) {
        return NextResponse.json({ 
          error: `State Transition Error: Cannot modify a quote that is currently in '${existingQuote.status}' state.` 
        }, { status: 409 });
      }

      const { error } = await serviceClient.from('quotes').update({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,
        bidded_price: biddedPrice,
        status: 'bidded'
      }).eq('id', finalQuoteId);
      if (error) throw error;

      // Fetch quote number for redirect
      const { data: q } = await serviceClient.from('quotes').select('quote_number').eq('id', finalQuoteId).single();
      finalQuoteNumber = q?.quote_number || '';
    }

    // Notify Admins
    try {
      await sendWhatsAppNotification(
        process.env.ADMIN_WHATSAPP_NUMBER || '+919604136010', 
        `🚨 *NEW QUOTE BID RECEIVED*\n\nCustomer: ${name}\nBid Price: ₹${biddedPrice}\n\nReview immediately in the Admin Desk: https://tecbunny.com/mgmt/admin/quotes`
      );
    } catch (e) {
      // Ignore whatsapp failure
    }

    return NextResponse.json({
      success: true,
      quoteId: finalQuoteId,
      quoteNumber: finalQuoteNumber || finalQuoteId,
      // Lets an anonymous bidder open and act on their own quote.
      actionToken: createQuoteActionToken(finalQuoteId as string, 'quote_customer'),
    });
  } catch (error) {
    logger.error('Bid submission failed', { error });
    return NextResponse.json({ 
      error: 'Failed to submit bid',
    }, { status: 500 });
  }
}
