import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { calculateMarketplacePrice } from '@tecbunny/core';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const purchasePrice = typeof body.sellerPurchasePrice === 'string' || typeof body.sellerPurchasePrice === 'number' ? Number(body.sellerPurchasePrice) : NaN;
  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) return NextResponse.json({ error: 'Valid Seller Purchase Price is required' }, { status: 400 });
  const category = typeof body.category === 'string' ? body.category : 'Default';
  const price = calculateMarketplacePrice({ sellerPurchasePrice: purchasePrice, category });
  return NextResponse.json({ success: true, message: 'Product draft submitted for Superadmin approval and price margin check', product: { id: `PRD-${randomUUID()}`, name: body.name, sku: body.sku, category, sellerPurchasePrice: purchasePrice, calculatedCustomerPrice: price.calculatedCustomerPrice, minCategoryMarginPercent: price.minCategoryMarginPercent, isBelowMinimumMargin: price.isBelowMinimumMargin, status: 'PENDING_APPROVAL' } });
}
