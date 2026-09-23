import { NextResponse } from 'next/server';
import { calculateSellerSettlement } from '@tecbunny/core';

export async function GET(request: Request) {
  const sellerId = new URL(request.url).searchParams.get('sellerId') || 'SLR-1092';
  const recentSettlement = calculateSellerSettlement({ sellerPurchasePrice: 1850, shippingDeduction: 50, commissionFeePercent: 5, tdsDeductionPercent: 1 }, true, true, false);
  return NextResponse.json({ success: true, sellerId, wallet: { availableBalance: 48250, pendingBalance: 24500, holdBalance: 0, totalWithdrawn: 342800 }, recentSettlement });
}
