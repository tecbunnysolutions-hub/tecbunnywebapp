import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';


import { rateLimit } from '@tecbunny/core/rate-limit';
import { twoFactorManager } from "@tecbunny/core/two-factor-manager";

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

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = await rateLimit(`2fa:verify:ip:${ip}`, 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify the 2FA code
    const result = await twoFactorManager.verifyTwoFactor(user.id, code, supabase);

    if (result.rateLimited) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }

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
