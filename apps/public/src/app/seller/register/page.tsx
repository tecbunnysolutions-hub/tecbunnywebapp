'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, Lock, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { validateGSTIN } from '@tecbunny/core';

export default function SellerRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    gstNumber: '',
    password: '',
    otp: '',
  });

  const [gstValidation, setGstValidation] = useState<{ isValidFormat: boolean; stateCode: string; panFromGST: string; entityType: string } | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleGSTChange = (gst: string) => {
    const uppercase = gst.toUpperCase();
    setFormData((prev) => ({ ...prev, gstNumber: uppercase }));
    if (uppercase.length === 15) {
      const res = validateGSTIN(uppercase);
      setGstValidation(res);
    } else {
      setGstValidation(null);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteredSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center items-center gap-3">
          <Building2 className="w-10 h-10 text-indigo-500" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">TecBunny Seller Partner Network</h1>
        </div>
        <p className="mt-2 text-center text-sm text-slate-400">
          Managed White-Label Commerce Platform. Reach millions of technology buyers across India.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {!registeredSuccess ? (
            step === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">
                    Step 1: Business Account Registration
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Legal Business Name
                  </label>
                  <div className="mt-1 relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Security Solutions Pvt Ltd"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Owner / Authorized Name
                    </label>
                    <div className="mt-1 relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Owner Name"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Official Email ID
                    </label>
                    <div className="mt-1 relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="seller@business.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Mobile Number
                    </label>
                    <div className="mt-1 relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      required
                      placeholder="27AAACA123411Z5"
                      value={formData.gstNumber}
                      onChange={(e) => handleGSTChange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                </div>

                {gstValidation && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium border ${
                      gstValidation.isValidFormat
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}
                  >
                    {gstValidation.isValidFormat ? (
                      <div>
                        ✓ Valid GSTIN Structure • State Code: {gstValidation.stateCode} • PAN: {gstValidation.panFromGST} ({gstValidation.entityType})
                      </div>
                    ) : (
                      <div>✕ Invalid GSTIN format. Must be 15 characters (e.g. 27AAACA123411Z5)</div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Account Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={12}
                      placeholder="Min 12 characters (upper, lower, num, symbol)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  Proceed to Mobile OTP Verification
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-2">
                    Step 2: Mobile OTP Verification
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter the 6-digit OTP sent to <span className="text-indigo-400 font-semibold">{formData.phone}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-center mb-2">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 text-center text-2xl font-mono tracking-widest text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  Verify OTP & Complete Account Setup
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-white">Seller Registration Submitted!</h2>
              <p className="text-sm text-slate-300">
                Your initial registration for <strong className="text-indigo-400">{formData.businessName}</strong> is complete. Next, complete your mandatory GST, PAN, Bank, and Document KYC.
              </p>
              <div className="pt-4">
                <a
                  href="/seller/kyc"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition text-sm"
                >
                  Complete KYC Onboarding Wizard
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
