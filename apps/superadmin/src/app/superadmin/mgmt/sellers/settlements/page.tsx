'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { calculateSellerSettlement } from '@tecbunny/core';

interface SettlementRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  orderId: string;
  sellerPurchasePrice: number;
  shippingDeduction: number;
  commissionPercent: number;
  tdsPercent: number;
  penalties: number;
  orderDelivered: boolean;
  returnWindowExpired: boolean;
  hasOpenDispute: boolean;
  status: 'DRAFT' | 'GENERATED' | 'APPROVED' | 'RELEASED' | 'HELD';
}

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'STL-9901',
    sellerId: 'SLR-1092',
    sellerName: 'Apex Security Solutions',
    orderId: 'ORD-77402',
    sellerPurchasePrice: 1850,
    shippingDeduction: 50,
    commissionPercent: 5,
    tdsPercent: 1,
    penalties: 0,
    orderDelivered: true,
    returnWindowExpired: true,
    hasOpenDispute: false,
    status: 'GENERATED',
  },
  {
    id: 'STL-9902',
    sellerId: 'SLR-1093',
    sellerName: 'NextGen IT Components',
    orderId: 'ORD-77405',
    sellerPurchasePrice: 24500,
    shippingDeduction: 200,
    commissionPercent: 3,
    tdsPercent: 1,
    penalties: 0,
    orderDelivered: true,
    returnWindowExpired: false, // Still in return window
    hasOpenDispute: false,
    status: 'DRAFT',
  },
];

export default function SuperadminSettlementEnginePage() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);

  const approveSettlement = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s))
    );
  };

  const releaseSettlement = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'RELEASED' } : s))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-2xl font-bold text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary" />
          Superadmin Automated Settlement & Wallet Release Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Double-Entry Ledger Accounting. Settlement formula: <span className="font-mono text-primary">Net = Seller Purchase Price - Deductions (Shipping + Commission + TDS + Penalties + GST)</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-card/80 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Settlement ID & Seller</th>
                <th className="px-6 py-4 font-semibold">Order Ref</th>
                <th className="px-6 py-4 font-semibold">Seller Purchase Price</th>
                <th className="px-6 py-4 font-semibold">Deductions Breakdown</th>
                <th className="px-6 py-4 font-semibold">Net Settlement Amount</th>
                <th className="px-6 py-4 font-semibold">Release Eligibility</th>
                <th className="px-6 py-4 font-semibold text-right">Superadmin Release Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settlements.map((stl) => {
                const calc = calculateSellerSettlement(
                  {
                    sellerPurchasePrice: stl.sellerPurchasePrice,
                    shippingDeduction: stl.shippingDeduction,
                    commissionFeePercent: stl.commissionPercent,
                    tdsDeductionPercent: stl.tdsPercent,
                    penalties: stl.penalties,
                  },
                  stl.orderDelivered,
                  stl.returnWindowExpired,
                  stl.hasOpenDispute
                );

                return (
                  <tr key={stl.id} className="hover:bg-card/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-muted-foreground">{stl.id}</div>
                      <div className="text-xs text-muted-foreground">{stl.sellerName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-primary">
                      {stl.orderId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">
                      ₹{stl.sellerPurchasePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div>Ship: ₹{calc.shippingDeduction} • Comm: ₹{calc.commissionFee}</div>
                      <div>TDS: ₹{calc.tdsDeduction} • Pen: ₹{calc.penalties}</div>
                      <div className="font-semibold text-destructive mt-0.5">Total Deductions: ₹{calc.totalDeductions}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-success text-base">
                      ₹{calc.netSettlementAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {calc.isEligibleForRelease ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Eligible for Release
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/20 text-warning border border-warning/30">
                          <Clock className="w-3.5 h-3.5" />
                          Return Window Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {stl.status === 'RELEASED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success border border-success/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Funds Released
                        </span>
                      ) : (
                        <button
                          disabled={!calc.isEligibleForRelease}
                          onClick={() => releaseSettlement(stl.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            calc.isEligibleForRelease
                              ? 'bg-primary hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                              : 'bg-card text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          Release Settlement
                        </button>
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
