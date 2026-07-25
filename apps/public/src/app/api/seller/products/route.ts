import { NextResponse } from 'next/server';
import { calculateMarketplacePrice } from '@tecbunny/core';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sku, category, sellerPurchasePrice, mrp, stock } = body;

    const price = parseFloat(sellerPurchasePrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Valid Seller Purchase Price is required' },
        { status: 400 }
      );
    }

    const priceCalc = calculateMarketplacePrice({
      sellerPurchasePrice: price,
      category: category || 'Default',
    });

    return NextResponse.json({
      success: true,
      message: 'Product draft submitted for Superadmin approval and price margin check',
      product: {
        id: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
        name,
        sku,
        category,
        sellerPurchasePrice: price,
        calculatedCustomerPrice: priceCalc.calculatedCustomerPrice,
        minCategoryMarginPercent: priceCalc.minCategoryMarginPercent,
        isBelowMinimumMargin: priceCalc.isBelowMinimumMargin,
        status: 'PENDING_APPROVAL',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
