import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';


import { twoFactorManager } from "@tecbunny/core/two-factor-manager";
import { logger } from "@tecbunny/core";
import { z } from 'zod';

const enrollmentSchema = z.object({
  secret: z.string().regex(/^[A-Z2-7]{16,128}$/),
  backupCodes: z.array(z.string().min(8).max(64)).min(1).max(20),
  verificationCode: z.string().regex(/^\d{6}$/),
});

// export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if 2FA is already enabled
  const status = await twoFactorManager.getTwoFactorStatus(user.id, supabase);
    if (status?.enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate 2FA secret and backup codes
    const setup = twoFactorManager.generateSecret(user.email || '');

    // Generate QR code
    const qrCodeDataUrl = await twoFactorManager.generateQRCode(setup.qrCodeUrl);

    return NextResponse.json({
      secret: setup.secret,
      qrCode: qrCodeDataUrl,
      backupCodes: setup.backupCodes,
      message: '2FA setup initiated. Scan the QR code with your authenticator app.'
    });

  } catch (error) {
    logger.error('two_factor.setup.error', { error });
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Re-enrollment must go through the existing disable flow, which verifies
    // the current factor. A code for a replacement secret proves nothing about it.
    const status = await twoFactorManager.getTwoFactorStatus(user.id, supabase);
    if (!status) {
      return NextResponse.json({ error: 'Unable to verify 2FA status' }, { status: 503 });
    }
    if (status.enabled) {
      return NextResponse.json({ error: 'Verify and disable your existing 2FA before setting it up again.' }, { status: 409 });
    }

    const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid 2FA setup details' },
        { status: 400 }
      );
    }
    const { secret, backupCodes, verificationCode } = parsed.data;

    // Verify the TOTP code to ensure setup is correct
    if (!twoFactorManager.verifyToken(secret, verificationCode)) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA for the user
  const success = await twoFactorManager.enableTwoFactor(user.id, secret, backupCodes, supabase);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '2FA has been successfully enabled for your account',
      backupCodes // Show backup codes one time only
    });

  } catch (error) {
    logger.error('two_factor.enable.error', { error });
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
