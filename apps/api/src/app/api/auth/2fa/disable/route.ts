import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';


import { twoFactorManager } from "@tecbunny/core/two-factor-manager";
import { rateLimit } from "@tecbunny/core/rate-limit";

// export const dynamic = 'force-dynamic';

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
    const attempts = await rateLimit(`2fa_disable:${user.id}`, 5, 5 * 60 * 1000);
    if (!attempts.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required to disable 2FA' },
        { status: 400 }
      );
    }

    // Verify the code before disabling (for security)
  const result = await twoFactorManager.verifyTwoFactor(user.id, code);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA
  const success = await twoFactorManager.disableTwoFactor(user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '2FA has been successfully disabled for your account'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
