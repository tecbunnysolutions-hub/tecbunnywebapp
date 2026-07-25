import { NextResponse } from 'next/server';
import { calculateSellerSettlement } from '@tecbunny/core';

export async function GET(req: Request) {
  try {
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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
