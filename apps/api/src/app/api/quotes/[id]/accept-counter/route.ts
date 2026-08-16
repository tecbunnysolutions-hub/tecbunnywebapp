import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServiceEnv } from "@tecbunny/database";
import { verifyQuoteActionToken } from "@tecbunny/core/quotes/action-token";
import { logger } from "@tecbunny/core/logger";

function createSupabaseAdmin() {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const body = await req.json().catch(() => ({}));

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let realId = id;
    if (!isUuid) {
      const { data: q } = await supabase.from('quotes').select('id').eq('quote_number', id).single();
      if (q) realId = q.id;
    }

    if (!verifyQuoteActionToken(body.actionToken, realId, ['quote_customer'])) {
      return NextResponse.json({ error: 'Secure quote action link is missing or expired' }, { status: 403 });
    }

    // Guard: only accept if currently in counter_offered state (prevents replays)
    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', realId)
      .eq('status', 'counter_offered')
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Quote is no longer available for acceptance' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, quote: data });
  } catch (error: unknown) {
    logger.error('quote_accept_counter_failed', { error });
    return NextResponse.json(
      { error: 'Failed to accept counter-offer' },
      { status: 400 }
    );
  }
}
