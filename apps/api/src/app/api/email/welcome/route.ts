import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { emailHelpers } from "@tecbunny/core/email";
import { handleEmailPost } from "@tecbunny/core/api-email-route";
import { logger } from '@tecbunny/core/logger';

interface WelcomePayload { to: string; userName: string }

export async function POST(request: NextRequest) {
  try {
    logger.info('email_welcome.audit.requested');
    return await handleEmailPost<WelcomePayload>(request as any, {
      rate: { bucket: 'email_welcome', limit: 5, windowMs: 60 * 60 * 1000 },
      validate(body: any) {
        const { to, userName } = body || {};
        if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: 'Invalid recipient email' } as const;
        if (!userName || typeof userName !== 'string') return { ok: false, error: 'Missing userName' } as const;
        return { ok: true, data: { to, userName } } as const;
      },
      async action(data) {
        return emailHelpers.sendWelcomeEmail(data.to, data.userName);
      }
    });
  } catch (error) {
    logger.error('email_welcome.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
