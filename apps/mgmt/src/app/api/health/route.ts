import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function GET() {
  try {
    logger.info('mgmt_health.audit.requested');
    return NextResponse.json({
      status: 'healthy',
      service: 'mgmt',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 });
  } catch (error) {
    logger.error('mgmt_health.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
