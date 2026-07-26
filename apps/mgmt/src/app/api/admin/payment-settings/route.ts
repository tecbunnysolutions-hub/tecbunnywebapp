import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function GET() {
  try {
    logger.info('mgmt_payment_settings.audit.read_requested');
    return NextResponse.json({ 
      message: 'Payment settings are now managed via code/environment variables.',
      paymentSettings: null 
    });
  } catch (error) {
    logger.error('mgmt_payment_settings.audit.read_failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to read payment settings' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    logger.info('mgmt_payment_settings.audit.write_blocked');
    return NextResponse.json({ 
      error: 'Payment settings are managed via code. Updates via API are disabled.' 
    }, { status: 403 });
  } catch (error) {
    logger.error('mgmt_payment_settings.audit.write_failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Payment settings update path failed' }, { status: 500 });
  }
}
