import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { otpManager } from "@tecbunny/core/otp-manager";

export async function GET() {
  try {
    logger.info('health_otp.audit.requested');
    const testEmail = 'healthcheck@example.com';
    const otp = await otpManager.generateOTP();
    const stored = await otpManager.storeOTP(testEmail, otp, 'signup');
    logger.info('health_otp.audit.success', { stored });
    return NextResponse.json({ ok: true, stored });
  } catch (error) {
    logger.error('health_otp.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 15;
