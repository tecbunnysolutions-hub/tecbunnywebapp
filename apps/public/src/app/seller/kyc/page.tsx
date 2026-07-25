'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileText, CreditCard, Building, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SellerKYCOnboardingPage() {
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    panNumber: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    pickupAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleSubmitKYC = (e: React.FormEvent) => {
    e.preventDefault();
    setKycSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto" />
          <h1 className="text-3xl font-extrabold text-white">Seller KYC & Statutory Verification</h1>
          <p className="text-sm text-slate-400">
            Provide GST, PAN, Bank Penny-Drop Details, and Warehouse Pickup Address for Superadmin Review
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {!kycSubmitted ? (
            <form onSubmit={handleSubmitKYC} className="space-y-6">
              {/* Section 1: Business Tax & PAN */}
              <div className="border-b border-slate-800 pb-5">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  1. Statutory Tax Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="AAACA12341"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Bank Account & Penny Drop */}
              <div className="border-b border-slate-800 pb-5">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  2. Settlement Bank Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="As per bank passbook"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="9182371283719"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      placeholder="HDFC0001234"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Primary Pickup Warehouse */}
              <div>
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-indigo-400" />
                  3. Primary Pickup Warehouse Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Address Line 1 & Building
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Plot 42, Industrial Area Phase 2"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400">City</label>
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400">State</label>
                      <input
                        type="text"
                        required
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm"
              >
                Submit KYC & Statutory Verification
                <Upload className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-white">KYC Documents Submitted Successfully!</h2>
              <p className="text-sm text-slate-300">
                Your statutory verification is now in progress. Superadmin will review your GSTIN, PAN, and Bank Penny-Drop verification shortly.
              </p>
              <div className="pt-4">
                <a
                  href="/seller/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition text-sm"
                >
                  Go to Seller Partner Dashboard
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
