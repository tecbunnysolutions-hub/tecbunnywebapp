'use client';

import React, { useState } from 'react';
import { DollarSign, ShieldAlert, Check, RefreshCw, Calculator, ArrowRight } from 'lucide-react';
import { calculateMarketplacePrice } from '@tecbunny/core';

interface ProductPriceRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  sellerName: string;
  sellerPurchasePrice: number;
  customMarginPercent: number;
  packagingCost: number;
  shippingRecovery: number;
  superadminOverride: boolean;
}

const INITIAL_PRODUCTS: ProductPriceRow[] = [
  {
    id: 'PRD-8801',
    sku: 'CP-UNC-TA41L3',
    name: '4MP IP Dome CCTV Camera with Night Vision',
    category: 'CCTV & Surveillance',
    sellerName: 'Apex Security Solutions',
    sellerPurchasePrice: 1850,
    customMarginPercent: 20,
    packagingCost: 40,
    shippingRecovery: 80,
    superadminOverride: false,
  },
  {
    id: 'PRD-8802',
    sku: 'NT-CIS-2960X',
    name: 'Gigabit Managed 24-Port Network Switch',
    category: 'Networking & IT',
    sellerName: 'NextGen IT Components',
    sellerPurchasePrice: 24500,
    customMarginPercent: 10, // Below min margin (15%) -> triggers alert!
    packagingCost: 200,
    shippingRecovery: 350,
    superadminOverride: false,
  },
];

export default function SuperadminPricingEnginePage() {
  const [products, setProducts] = useState<ProductPriceRow[]>(INITIAL_PRODUCTS);

  const updateMargin = (id: string, margin: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, customMarginPercent: margin } : p))
    );
  };

  const toggleOverride = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, superadminOverride: !p.superadminOverride } : p))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-2xl font-bold text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-success" />
          Superadmin White-Label Pricing & Margin Control Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sellers provide net wholesale Purchase Price. Superadmin strictly controls Customer Selling Price, Minimum Margins, and Override Protections.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-card/80 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Name & SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Seller Purchase Price</th>
                <th className="px-6 py-4 font-semibold">Applied Margin (%)</th>
                <th className="px-6 py-4 font-semibold">Calculated Customer Price</th>
                <th className="px-6 py-4 font-semibold text-center">Margin Validation</th>
                <th className="px-6 py-4 font-semibold text-right">Superadmin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((prd) => {
                const calc = calculateMarketplacePrice({
                  sellerPurchasePrice: prd.sellerPurchasePrice,
                  category: prd.category,
                  customMarginPercent: prd.customMarginPercent,
                  packagingCost: prd.packagingCost,
                  shippingRecovery: prd.shippingRecovery,
                });

                return (
                  <tr key={prd.id} className="hover:bg-card/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-muted-foreground">{prd.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {prd.sku} • Supplier: {prd.sellerName}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-primary">
                      {prd.category}
                    </td>
                    <td className="px-6 py-4 font-semibold text-success">
                      ₹{prd.sellerPurchasePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={prd.customMarginPercent}
                          onChange={(e) => updateMargin(prd.id, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-card border border-border rounded-lg text-center px-2 py-1 text-sm font-semibold text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground text-base">
                      ₹{calc.finalCustomerPrice.toLocaleString('en-IN')}
                      <div className="text-[10px] font-normal text-muted-foreground">
                        Margin: ₹{calc.marginAmount} | Tax: ₹{calc.taxAmount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {calc.isBelowMinimumMargin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/20 text-destructive border border-destructive/30">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Below Min ({calc.minCategoryMarginPercent}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                          <Check className="w-3.5 h-3.5" />
                          Valid Margin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {calc.isBelowMinimumMargin ? (
                        <button
                          onClick={() => toggleOverride(prd.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            prd.superadminOverride
                              ? 'bg-warning hover:bg-warning text-warning-foreground'
                              : 'bg-destructive hover:bg-destructive text-destructive-foreground'
                          }`}
                        >
                          {prd.superadminOverride ? 'Override Authorized' : 'Authorize Override'}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Auto-Approved</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
