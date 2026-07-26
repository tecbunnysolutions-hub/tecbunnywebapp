import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function GET() {
  try {
    logger.info('hello_api.audit.requested');
    return NextResponse.json({ message: 'Hello from api app!' });
  } catch (error) {
    logger.error('hello_api.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Hello endpoint failed' }, { status: 500 });
  }
}
