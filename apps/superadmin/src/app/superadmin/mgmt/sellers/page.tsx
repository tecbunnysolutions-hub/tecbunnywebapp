'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  RefreshCw 
} from 'lucide-react';

interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  status: 'DRAFT' | 'PENDING_VERIFICATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rating: number;
  createdAt: string;
}

const MOCK_SELLERS: Seller[] = [
  {
    id: 'SLR-1092',
    businessName: 'Apex Security Solutions Pvt Ltd',
    ownerName: 'Vikram Sharma',
    email: 'contact@apexsecurity.in',
    phone: '+91 98765 43210',
    gstNumber: '27AAACA123411Z5',
    panNumber: 'AAACA12341',
    status: 'APPROVED',
    kycStatus: 'APPROVED',
    rating: 98.4,
    createdAt: '2026-06-12',
  },
  {
    id: 'SLR-1093',
    businessName: 'NextGen IT Components Hub',
    ownerName: 'Priya Sundaram',
    email: 'admin@nextgenhub.com',
    phone: '+91 98123 45678',
    gstNumber: '29AABCN567812Z3',
    panNumber: 'AABCN56781',
    status: 'PENDING_APPROVAL',
    kycStatus: 'SUBMITTED',
    rating: 100.0,
    createdAt: '2026-07-20',
  },
  {
    id: 'SLR-1094',
    businessName: 'Vanguard Fiber & Telecom Distributors',
    ownerName: 'Rajesh Gupta',
    email: 'info@vanguardfiber.co.in',
    phone: '+91 97654 32109',
    gstNumber: '33AABCV998811Z9',
    panNumber: 'AABCV99881',
    status: 'PENDING_VERIFICATION',
    kycStatus: 'DRAFT',
    rating: 92.1,
    createdAt: '2026-07-24',
  },
];

export default function SuperadminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [search, setSearch] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [actionModal, setActionModal] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | null>(null);
  const [reason, setReason] = useState('');

  const filteredSellers = sellers.filter(
    (s) =>
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.gstNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (seller: Seller, action: 'APPROVE' | 'REJECT' | 'SUSPEND') => {
    setSelectedSeller(seller);
    setActionModal(action);
  };

  const confirmAction = () => {
    if (!selectedSeller || !actionModal) return;
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id !== selectedSeller.id) return s;
        if (actionModal === 'APPROVE') return { ...s, status: 'APPROVED', kycStatus: 'APPROVED' };
        if (actionModal === 'REJECT') return { ...s, status: 'REJECTED', kycStatus: 'REJECTED' };
        if (actionModal === 'SUSPEND') return { ...s, status: 'SUSPENDED' };
        return s;
      })
    );
    setActionModal(null);
    setSelectedSeller(null);
    setReason('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Third-Party Seller Management Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Superadmin Governance: Seller Onboarding, KYC Verification, Approval Controls & Performance Scores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/superadmin/mgmt/sellers/pricing"
            className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-indigo-500/30 flex items-center gap-2 transition"
          >
            <DollarSign className="w-4 h-4" />
            Pricing Engine
          </a>
          <a
            href="/superadmin/mgmt/sellers/settlements"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Settlements Engine
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Sellers</p>
          <p className="text-2xl font-bold text-white mt-1">{sellers.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-amber-500/20 p-4 rounded-xl">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">
            {sellers.filter((s) => s.status === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-emerald-500/20 p-4 rounded-xl">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Approved Sellers</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">
            {sellers.filter((s) => s.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">White-Label Privacy</p>
          <p className="text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            100% Brand Isolation Active
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Business, Owner, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {filteredSellers.length} of {sellers.length} seller profiles
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Seller & Business Name</th>
                <th className="px-6 py-4 font-semibold">Contact & GSTIN</th>
                <th className="px-6 py-4 font-semibold">KYC Status</th>
                <th className="px-6 py-4 font-semibold">Marketplace Status</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold text-right">Superadmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-100">{seller.businessName}</div>
                    <div className="text-xs text-slate-400">ID: {seller.id} • Owner: {seller.ownerName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{seller.email}</div>
                    <div className="text-xs text-slate-400">{seller.phone}</div>
                    <div className="text-xs font-mono text-indigo-400 mt-1">GST: {seller.gstNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        seller.kycStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : seller.kycStatus === 'SUBMITTED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {seller.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        seller.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : seller.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : seller.status === 'SUSPENDED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {seller.rating.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {seller.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => handleAction(seller, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(seller, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold transition flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {seller.status === 'APPROVED' && (
                        <button
                          onClick={() => handleAction(seller, 'SUSPEND')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold transition"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionModal && selectedSeller && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm Superadmin Action: {actionModal}
            </h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to <strong>{actionModal.toLowerCase()}</strong> seller{' '}
              <span className="text-indigo-400 font-semibold">{selectedSeller.businessName}</span>?
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Audit Log Reason / Notes</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter mandatory reason for audit trail..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-600/30"
              >
                Confirm {actionModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
