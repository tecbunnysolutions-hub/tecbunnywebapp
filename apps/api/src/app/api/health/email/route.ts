import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import improvedEmailService from "@tecbunny/core/improved-email-service";
import { requireInternalAccess } from '../../../../lib/internal-auth';

export async function GET(request: NextRequest) {
  const accessDenied = requireInternalAccess(request);
  if (accessDenied) return accessDenied;

  try {
    logger.info('health_email.audit.requested');
    const status = await improvedEmailService.getConnectionStatus();
    logger.info('health_email.audit.success');
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    logger.error('health_email.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 15;
