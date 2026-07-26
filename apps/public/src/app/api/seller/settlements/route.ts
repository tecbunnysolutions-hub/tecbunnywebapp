import { NextResponse } from 'next/server';
import { calculateSellerSettlement } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';

export async function GET(req: Request) {
  try {
    logger.info('public_seller_settlements.audit.requested');
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId') || 'SLR-1092';

    const settlementCalc = calculateSellerSettlement(
      {
        sellerPurchasePrice: 1850,
        shippingDeduction: 50,
        commissionFeePercent: 5,
        tdsDeductionPercent: 1,
      },
      true,
      true,
      false
    );

    logger.info('public_seller_settlements.audit.success', { sellerId });
    return NextResponse.json({
      success: true,
      sellerId,
      wallet: {
        availableBalance: 48250,
        pendingBalance: 24500,
        holdBalance: 0,
        totalWithdrawn: 342800,
      },
      recentSettlement: settlementCalc,
    });
  } catch (error: any) {
    logger.error('public_seller_settlements.audit.failed', { error: error?.message || 'Internal Server Error' });
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
