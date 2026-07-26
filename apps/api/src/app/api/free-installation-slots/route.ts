import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from "@tecbunny/core";

function isAuthorizedInternalRequest(request: NextRequest) {
  const expected = process.env.INTERNAL_API_KEY || process.env.INTERNAL_API_TOKEN || process.env.CRON_SECRET;
  const provided = request.headers.get('x-internal-api-key') || request.headers.get('x-internal-api-token');

  return Boolean(expected && provided && provided === expected);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured');
  }
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthStart = currentMonth.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('free_installation_slots')
      .select('remaining_slots, confirmed_count, total_slots')
      .eq('month', monthStart)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // If no record exists for this month, return 10 remaining (will be created on first update)
    if (!data) {
      return NextResponse.json({
        success: true,
        remainingSlots: 10,
        confirmedCount: 0,
        totalSlots: 10,
      });
    }

    return NextResponse.json({
      success: true,
      remainingSlots: data.remaining_slots,
      confirmedCount: data.confirmed_count,
      totalSlots: data.total_slots,
    });
  } catch (error: any) {
    logger.error('free_installation_slots.fetch_failed', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({
      success: true,
      remainingSlots: 10,
      confirmedCount: 0,
      totalSlots: 10,
    });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthStart = currentMonth.toISOString().split('T')[0];

    // Ensure monthly slot row exists before decrement attempts.
    const { error: ensureError } = await supabase
      .from('free_installation_slots')
      .upsert({
        month: monthStart,
        total_slots: 10,
        remaining_slots: 10,
        confirmed_count: 0,
      }, { onConflict: 'month', ignoreDuplicates: true });

    if (ensureError) throw ensureError;

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: existingSlot, error: readError } = await supabase
        .from('free_installation_slots')
        .select('remaining_slots, confirmed_count, total_slots, id')
        .eq('month', monthStart)
        .single();

      if (readError || !existingSlot?.id) {
        throw readError || new Error('Failed to read free installation slots record');
      }

      if (existingSlot.remaining_slots <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'No free installation slots remaining for this month',
            remainingSlots: 0,
            confirmedCount: existingSlot.confirmed_count,
          },
          { status: 400 }
        );
      }

      const { data: updatedSlot, error: updateError } = await supabase
        .from('free_installation_slots')
        .update({
          remaining_slots: existingSlot.remaining_slots - 1,
          confirmed_count: existingSlot.confirmed_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSlot.id)
        .eq('remaining_slots', existingSlot.remaining_slots)
        .eq('confirmed_count', existingSlot.confirmed_count)
        .select('remaining_slots, confirmed_count')
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (updatedSlot) {
        return NextResponse.json({
          success: true,
          message: 'Free installation slot decremented',
          remainingSlots: updatedSlot.remaining_slots,
          confirmedCount: updatedSlot.confirmed_count,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Conflict while updating free installation slots. Please retry.' },
      { status: 409 }
    );
  } catch (error: any) {
    logger.error('free_installation_slots.decrement_failed', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { success: false, error: 'Failed to update free installation slots' },
      { status: 500 }
    );
  }
}
