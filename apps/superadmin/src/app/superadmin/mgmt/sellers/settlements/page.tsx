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
      <div className="border-b border-slate-700/60 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-indigo-400" />
          Superadmin Automated Settlement & Wallet Release Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Double-Entry Ledger Accounting. Settlement formula: <span className="font-mono text-indigo-300">Net = Seller Purchase Price - Deductions (Shipping + Commission + TDS + Penalties + GST)</span>
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
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
            <tbody className="divide-y divide-slate-800">
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
                  <tr key={stl.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{stl.id}</div>
                      <div className="text-xs text-slate-400">{stl.sellerName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                      {stl.orderId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      ₹{stl.sellerPurchasePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div>Ship: ₹{calc.shippingDeduction} • Comm: ₹{calc.commissionFee}</div>
                      <div>TDS: ₹{calc.tdsDeduction} • Pen: ₹{calc.penalties}</div>
                      <div className="font-semibold text-rose-400 mt-0.5">Total Deductions: ₹{calc.totalDeductions}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 text-base">
                      ₹{calc.netSettlementAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {calc.isEligibleForRelease ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Eligible for Release
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          Return Window Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {stl.status === 'RELEASED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Funds Released
                        </span>
                      ) : (
                        <button
                          disabled={!calc.isEligibleForRelease}
                          onClick={() => releaseSettlement(stl.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            calc.isEligibleForRelease
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
