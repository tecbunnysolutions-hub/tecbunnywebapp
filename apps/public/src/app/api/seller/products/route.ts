import { NextResponse } from 'next/server';
import { calculateMarketplacePrice } from '@tecbunny/core';
import { logger } from '@tecbunny/core/logger';

export async function POST(req: Request) {
  try {
    logger.info('public_seller_products.audit.requested');
    const body = await req.json();
    const { name, sku, category, sellerPurchasePrice, mrp, stock } = body;
    void mrp;
    void stock;

    const price = parseFloat(sellerPurchasePrice);
    if (isNaN(price) || price <= 0) {
      logger.warn('public_seller_products.audit.validation_failed');
      return NextResponse.json(
        { error: 'Valid Seller Purchase Price is required' },
        { status: 400 }
      );
    }

    const priceCalc = calculateMarketplacePrice({
      sellerPurchasePrice: price,
      category: category || 'Default',
    });

    logger.info('public_seller_products.audit.success', { sku, category: category || 'Default' });
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
    logger.error('public_seller_products.audit.failed', { error: error?.message || 'Internal Server Error' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
