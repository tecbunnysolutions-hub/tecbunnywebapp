import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function GET() {
  try {
    logger.info('webmail_health.audit.requested');
    const mockWebmailEnabled = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK === 'true';
    const requiredProviderEnv = ['WEBMAIL_IMAP_HOST', 'WEBMAIL_SMTP_HOST', 'WEBMAIL_MAILBOX_USER'];
    const missingProviderEnv = requiredProviderEnv.filter((key) => !process.env[key]);
    const providerReady = missingProviderEnv.length === 0;

    logger.info('webmail_health.audit.success', { mode: mockWebmailEnabled ? 'mock' : providerReady ? 'provider-ready' : 'disabled' });
    return NextResponse.json({
      status: mockWebmailEnabled || providerReady ? 'healthy' : 'configuration_required',
      service: 'webmail',
      mode: mockWebmailEnabled ? 'mock' : providerReady ? 'provider-ready' : 'disabled',
      providerReady,
      missingProviderEnv,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 });
  } catch (error) {
    logger.error('webmail_health.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
