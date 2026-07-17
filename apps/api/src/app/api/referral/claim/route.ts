import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';

const ClaimSchema = z.object({
  code: z.string().min(6).max(16).toUpperCase(),
});

const REFERRAL_REWARD_CREDITS = 100; // ₹100 store credit per successful referral

/**
 * POST /api/referral/claim
 * Apply a referral code during signup. Rewards both referrer and referee.
 * - Called immediately after signup, before the user places their first order.
 * - Prevents self-referral and double-claims.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rlResult = await rateLimit(`referral_claim:${user.id}`, 5, 3_600_000);
    if (!rlResult.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const parsed = ClaimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid referral code format.' }, { status: 400 });
    }

    const { code } = parsed.data;

    // Fetch the referral code
    const { data: refCode, error: codeErr } = await supabase
      .from('referral_codes')
      .select('id, user_id, code, is_active')
      .eq('code', code)
      .maybeSingle();

    if (codeErr || !refCode) {
      return NextResponse.json({ error: 'Invalid or expired referral code.' }, { status: 404 });
    }

    if (!refCode.is_active) {
      return NextResponse.json({ error: 'This referral code is no longer active.' }, { status: 400 });
    }

    // Self-referral guard
    if (refCode.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot use your own referral code.' }, { status: 400 });
    }

    // Double-claim guard
    const { data: existingClaim } = await supabase
      .from('referral_claims')
      .select('id')
      .eq('referee_user_id', user.id)
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already applied a referral code.' }, { status: 409 });
    }

    // Record the claim
    const { error: claimErr } = await supabase.from('referral_claims').insert({
      referral_code_id: refCode.id,
      referrer_user_id: refCode.user_id,
      referee_user_id: user.id,
      reward_amount: REFERRAL_REWARD_CREDITS,
      status: 'pending', // fulfilled when referee places first order
    });

    if (claimErr) {
      logger.error('referral.claim_insert_failed', { error: claimErr.message, userId: user.id });
      return NextResponse.json({ error: 'Failed to apply referral code.' }, { status: 500 });
    }

    // Increment usage counter on the code
    await supabase.rpc('increment_referral_code_uses', { code_id: refCode.id });

    logger.info('referral.claimed', { code, referrerId: refCode.user_id, refereeId: user.id });

    return NextResponse.json({
      success: true,
      message: `Referral code applied! You'll both receive ₹${REFERRAL_REWARD_CREDITS} credit once your first order is placed.`,
      reward: REFERRAL_REWARD_CREDITS,
    });
  } catch (err: any) {
    logger.error('referral.claim_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
