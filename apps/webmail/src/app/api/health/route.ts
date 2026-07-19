import { NextResponse } from 'next/server';

export async function GET() {
  const mockWebmailEnabled = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK === 'true';

  return NextResponse.json({
    status: 'healthy',
    service: 'webmail',
    mode: mockWebmailEnabled ? 'mock' : 'disabled',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, { status: 200 });
}
