import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/referral
 * Returns the authenticated user's referral code (creates one if not exists).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: existing } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return NextResponse.json({ referral: existing });

    // Create a new code
    const code = randomBytes(4).toString('hex').toUpperCase(); // 8-char code e.g. "A3F7B2C1"
    const { data: created, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code, total_uses: 0, total_rewards: 0 })
      .select()
      .single();

    if (error) {
      logger.error('referral.create_failed', { error: error.message, userId: user.id });
      return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
    }

    return NextResponse.json({ referral: created });
  } catch (err: any) {
    logger.error('referral.get_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
