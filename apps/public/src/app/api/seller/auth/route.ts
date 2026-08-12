import { NextResponse } from 'next/server';
import { validateGSTIN } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';

export async function POST(req: Request) {
  try {
    logger.info('public_seller_auth.audit.requested');
    const body = await req.json();
    const { businessName, ownerName, email, phone, gstNumber, password } = body;
    void password;

    if (!businessName || !email || !phone || !gstNumber) {
      logger.warn('public_seller_auth.audit.validation_failed');
      return NextResponse.json(
        { error: 'Missing required seller registration fields' },
        { status: 400 }
      );
    }

    const gstVal = validateGSTIN(gstNumber);
    if (!gstVal.isValidFormat) {
      logger.warn('public_seller_auth.audit.invalid_gstin');
      return NextResponse.json(
        { error: 'Invalid GSTIN structure' },
        { status: 400 }
      );
    }

    logger.info('public_seller_auth.audit.success', { email });
    return NextResponse.json({
      success: true,
      message: 'Seller account draft created. Mobile OTP verification required.',
      seller: {
        id: 'SLR-' + Math.floor(1000 + Math.random() * 9000),
        businessName,
        ownerName,
        email,
        phone,
        gstNumber,
        status: 'PENDING_VERIFICATION',
        kycStatus: 'DRAFT',
      },
    });
  } catch (error: any) {
    logger.error('public_seller_auth.audit.failed', { error: error?.message || 'Internal Server Error' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
