import { NextResponse } from 'next/server';

export async function GET() {
  const webmailRequiredEnv = ['WEBMAIL_IMAP_HOST', 'WEBMAIL_SMTP_HOST', 'WEBMAIL_MAILBOX_USER'];
  const missingWebmailEnv = webmailRequiredEnv.filter((key) => !process.env[key]);
  const checks = [
    {
      id: 'superadmin-runtime',
      label: 'Superadmin runtime',
      status: 'healthy',
      detail: 'Superadmin API route is responding.',
    },
    {
      id: 'webmail-provider',
      label: 'Webmail provider contract',
      status: missingWebmailEnv.length === 0 ? 'healthy' : 'configuration_required',
      detail: missingWebmailEnv.length === 0
        ? 'Required mailbox provider settings are present.'
        : `Missing ${missingWebmailEnv.join(', ')}.`,
    },
    {
      id: 'environment',
      label: 'Deployment environment',
      status: process.env.NODE_ENV === 'production' ? 'healthy' : 'informational',
      detail: `Running in ${process.env.NODE_ENV || 'development'} mode.`,
    },
  ];

  return NextResponse.json({
    status: checks.some((check) => check.status === 'configuration_required') ? 'configuration_required' : 'healthy',
    service: 'superadmin',
    checks,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, { status: 200 });
}
