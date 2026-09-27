import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';


import { twoFactorManager } from "@tecbunny/core/two-factor-manager";
import { rateLimit } from "@tecbunny/core/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Bound code guessing per account (Redis-backed when configured).
    const attempts = await rateLimit(`2fa_verify:${user.id}`, 5, 5 * 60 * 1000);
    if (!attempts.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Verify the 2FA code
  const result = await twoFactorManager.verifyTwoFactor(user.id, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      backupCodeUsed: result.backupCodeUsed || false
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
