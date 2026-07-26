import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { emailHelpers } from "@tecbunny/core/email";
import { handleEmailPost } from "@tecbunny/core/api-email-route";
import { logger } from '@tecbunny/core/logger';

interface EmailChangePayload { to: string; userName: string; otp: string }

export async function POST(request: NextRequest) {
  try {
    logger.info('email_change.audit.requested');
    return await handleEmailPost<EmailChangePayload>(request as any, {
      rate: { bucket: 'email_change_otp', limit: 5, windowMs: 30 * 60 * 1000 },
      validate(body: any) {
        const { to, userName, otp } = body || {};
        if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: 'Invalid recipient email' } as const;
        if (!userName || typeof userName !== 'string' || !otp || typeof otp !== 'string') return { ok: false, error: 'Missing required fields' } as const;
        return { ok: true, data: { to, userName, otp } } as const;
      },
      async action(data) {
        return emailHelpers.sendEmailChangeOTP(data.to, data.userName, data.otp);
      }
    });
  } catch (error) {
    logger.error('email_change.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to send email change OTP' }, { status: 500 });
  }
}
