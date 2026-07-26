import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function POST(req: Request) {
  try {
    logger.info('public_seller_login.audit.requested');
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      logger.warn('public_seller_login.audit.validation_failed');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    logger.info('public_seller_login.audit.success', { email });
    return NextResponse.json({
      success: true,
      message: 'Seller authentication successful',
      token: 'jwt-seller-token-mock',
      seller: {
        id: 'SLR-1092',
        businessName: 'Apex Security Solutions Pvt Ltd',
        email,
        status: 'APPROVED',
      },
    });
  } catch (error: any) {
    logger.error('public_seller_login.audit.failed', { error: error?.message || 'Internal Server Error' });
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
