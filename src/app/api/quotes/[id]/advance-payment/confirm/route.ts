import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSupabaseServiceEnv } from '@/lib/supabase/env';
import { verifyQuoteActionToken } from '@/lib/quotes/action-token';

let supabaseAdmin: any = null;

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    supabaseAdmin = createClient(url, serviceKey);
  }

  return supabaseAdmin;
}

interface ConfirmAdvancePaymentPayload {
  advance_payment_id: string;
  final_quotation_url?: string;
  customer_notes?: string;
  agree_to_terms: boolean;
  actionToken?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const payload: ConfirmAdvancePaymentPayload = await req.json();
    const { advance_payment_id, final_quotation_url, customer_notes, agree_to_terms, actionToken } = payload;

    if (!advance_payment_id || !agree_to_terms) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let routeQuoteId = id;
    if (!isUuid) {
      const { data: quoteByNumber } = await supabase
        .from('quotes')
        .select('id')
        .eq('quote_number', id)
        .maybeSingle();
      routeQuoteId = quoteByNumber?.id || id;
    }

    // Fetch advance payment request
    const { data: advancePayment, error: fetchError } = await supabase
      .from('advance_payment_requests')
      .select('*')
      .eq('id', advance_payment_id)
      .single();

    if (fetchError || !advancePayment) {
      return NextResponse.json(
        { success: false, error: 'Advance payment request not found' },
        { status: 404 }
      );
    }

    if (advancePayment.quote_id !== routeQuoteId) {
      return NextResponse.json(
        { success: false, error: 'Advance payment request does not match quote' },
        { status: 403 }
      );
    }

    if (!verifyQuoteActionToken(actionToken, advancePayment.quote_id, ['advance_payment'])) {
      return NextResponse.json(
        { success: false, error: 'Secure payment action link is missing or expired' },
        { status: 403 }
      );
    }

    if (advancePayment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot confirm advance payment with status: ${advancePayment.status}` },
        { status: 409 }
      );
    }

    // Update advance payment request status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('advance_payment_requests')
      .update({
        status: 'confirmed',
        final_quotation_url: final_quotation_url || null,
        customer_notes: customer_notes || null,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', advance_payment_id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to confirm advance payment:', { updateError });
      return NextResponse.json(
        { success: false, error: 'Failed to confirm advance payment' },
        { status: 500 }
      );
    }

    // Fetch quote to get customer info
    const { data: quote } = await supabase
      .from('quotes')
      .select('customer_name, customer_email, customer_phone')
      .eq('id', advancePayment.quote_id)
      .single();

    logger.info('Advance payment confirmed by customer', {
      advance_payment_id,
      quote_id: advancePayment.quote_id,
      customer_notes: !!customer_notes,
      has_quotation: !!final_quotation_url,
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Advance payment confirmed. Proceeding to payment...',
    });

  } catch (error: any) {
    logger.error('Error confirming advance payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: advancePayment, error } = await supabase
      .from('advance_payment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !advancePayment) {
      return NextResponse.json(
        { success: false, error: 'Advance payment request not found' },
        { status: 404 }
      );
    }

    // Fetch associated quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('id, customer_name, customer_email, counter_price, negotiation_clauses')
      .eq('id', advancePayment.quote_id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        ...advancePayment,
        quote,
      },
    });

  } catch (error: any) {
    logger.error('Error fetching advance payment request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
