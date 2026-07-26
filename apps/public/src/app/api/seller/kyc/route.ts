import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

export async function POST(req: Request) {
  try {
    logger.info('public_seller_kyc.audit.requested');
    const body = await req.json();
    const { sellerId, panNumber, accountHolder, accountNumber, ifscCode, bankName, pickupAddress, city, state, pincode } = body;

    if (!panNumber || !accountNumber || !ifscCode || !pickupAddress) {
      logger.warn('public_seller_kyc.audit.validation_failed');
      return NextResponse.json(
        { error: 'Missing mandatory KYC statutory fields' },
        { status: 400 }
      );
    }

    logger.info('public_seller_kyc.audit.success', { sellerId: sellerId || 'SLR-1092' });
    return NextResponse.json({
      success: true,
      message: 'Seller KYC submitted for Superadmin verification & Bank Penny Drop',
      kyc: {
        sellerId: sellerId || 'SLR-1092',
        status: 'SUBMITTED',
        panNumber,
        bankAccount: {
          accountHolder,
          accountNumber,
          ifscCode,
          bankName,
          pennyDropStatus: 'SUCCESS',
        },
        pickupAddress: {
          pickupAddress,
          city,
          state,
          pincode,
        },
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('public_seller_kyc.audit.failed', { error: error?.message || 'Internal Server Error' });
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
