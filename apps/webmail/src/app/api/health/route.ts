import { NextResponse } from 'next/server';

export async function GET() {
  const mockWebmailEnabled = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK === 'true';
  const requiredProviderEnv = ['WEBMAIL_IMAP_HOST', 'WEBMAIL_SMTP_HOST', 'WEBMAIL_MAILBOX_USER'];
  const missingProviderEnv = requiredProviderEnv.filter((key) => !process.env[key]);
  const providerReady = missingProviderEnv.length === 0;

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
}
