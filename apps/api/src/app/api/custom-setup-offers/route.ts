import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date().toISOString();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('custom_setup_offers')
      .select('id,title,description,offer_type,offer_value,end_date')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.warn('custom_setup_offers.fetch_failed', {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: data ?? null });
  } catch (error) {
    logger.warn('custom_setup_offers.unavailable', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ success: true, data: null });
  }
}