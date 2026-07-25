'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  Wallet, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  Tag,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface SellerOrder {
  id: string;
  orderNumber: string;
  productName: string;
  sku: string;
  qty: number;
  sellerPurchasePrice: number;
  status: 'PENDING_ACCEPT' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'DELIVERED';
  createdAt: string;
}

const MOCK_ORDERS: SellerOrder[] = [
  {
    id: 'SO-101',
    orderNumber: 'ORD-77402',
    productName: '4MP IP Dome CCTV Camera with Night Vision',
    sku: 'CP-UNC-TA41L3',
    qty: 2,
    sellerPurchasePrice: 1850,
    status: 'PREPARING',
    createdAt: '2026-07-25 09:30 AM',
  },
  {
    id: 'SO-102',
    orderNumber: 'ORD-77405',
    productName: 'Gigabit Managed 24-Port Network Switch',
    sku: 'NT-CIS-2960X',
    qty: 1,
    sellerPurchasePrice: 24500,
    status: 'READY_FOR_PICKUP',
    createdAt: '2026-07-24 04:15 PM',
  },
];

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'SETTLEMENTS'>('OVERVIEW');
  const [orders, setOrders] = useState<SellerOrder[]>(MOCK_ORDERS);

  // New product draft form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'CCTV & Surveillance',
    sellerPurchasePrice: '',
    mrp: '',
    stock: '',
    description: '',
  });
  const [productCreated, setProductCreated] = useState(false);

  const markReadyForPickup = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'READY_FOR_PICKUP' } : o))
    );
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductCreated(true);
    setTimeout(() => {
      setProductCreated(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'CCTV & Surveillance',
        sellerPurchasePrice: '',
        mrp: '',
        stock: '',
        description: '',
      });
      setActiveTab('OVERVIEW');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Apex Security Solutions Pvt Ltd</h1>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Seller ID: SLR-1092</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Partner
              </span>
              <span>•</span>
              <span className="text-indigo-300 font-medium">100% White-Label Isolation Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" /> Add Product Draft
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['OVERVIEW', 'PRODUCTS', 'ORDERS', 'SETTLEMENTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-medium text-slate-400 uppercase">Available Settlement Balance</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">₹48,250</p>
              <p className="text-[11px] text-slate-500 mt-1">Post-return window release</p>
            </div>
            <div className="bg-slate-900 border border-amber-500/20 p-5 rounded-xl">
              <p className="text-xs font-medium text-amber-400 uppercase">Pending Settlement Balance</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">₹24,500</p>
              <p className="text-[11px] text-slate-500 mt-1">Awaiting 7-day return expiration</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-medium text-slate-400 uppercase">Assigned Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
              <p className="text-[11px] text-indigo-400 mt-1">Ready for pickup: {orders.filter(o => o.status === 'READY_FOR_PICKUP').length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs font-medium text-slate-400 uppercase">Seller Quality Score</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">98.4 / 100</p>
              <p className="text-[11px] text-emerald-400 mt-1">On-Time Pickup SLA: 99.1%</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              Pending Pickup Orders ("Ready for Pickup" SLA Workflow)
            </h3>
            <div className="divide-y divide-slate-800">
              {orders.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-100">{ord.productName}</div>
                    <div className="text-xs text-slate-400">Order: {ord.orderNumber} • Qty: {ord.qty} • SKU: {ord.sku}</div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1">Agreed Wholesale Purchase Price: ₹{ord.sellerPurchasePrice}</div>
                  </div>
                  <div>
                    {ord.status === 'READY_FOR_PICKUP' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Pickup (TecBunny Dispatch)
                      </span>
                    ) : (
                      <button
                        onClick={() => markReadyForPickup(ord.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
                      >
                        Pack & Mark "Ready for Pickup"
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Submit Product Draft (Wholesale Supply Model)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide net <strong className="text-indigo-300">Seller Purchase Price</strong>. TecBunny Superadmin handles Customer Selling Price and Branding.
            </p>
          </div>

          {productCreated && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Product Draft Submitted for Superadmin Approval & Margin Check!
            </div>
          )}

          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 8-Channel PoE CCTV NVR Recorder"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400">SKU / Model Number</label>
                <input
                  type="text"
                  required
                  placeholder="NVR-8CH-POE"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                >
                  <option value="CCTV & Surveillance">CCTV & Surveillance</option>
                  <option value="Networking & IT">Networking & IT</option>
                  <option value="Computers & Laptops">Computers & Laptops</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-400">Seller Purchase Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="1200"
                  value={newProduct.sellerPurchasePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellerPurchasePrice: e.target.value })}
                  className="w-full bg-slate-800 border border-emerald-500/40 rounded-lg px-4 py-2 text-sm font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">MRP (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="2400"
                  value={newProduct.mrp}
                  onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition text-sm"
            >
              Submit Product for Superadmin Pricing & Catalog Review
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'ORDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Assigned Marketplace Orders</h2>
          <div className="divide-y divide-slate-800">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100">{ord.productName}</div>
                  <div className="text-xs text-slate-400">Ref: {ord.orderNumber} • Qty: {ord.qty} • Created: {ord.createdAt}</div>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Settlements */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Wallet Ledger & Financial Settlements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold text-emerald-400">₹48,250</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Pending Balance</p>
              <p className="text-2xl font-bold text-amber-300">₹24,500</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Total Settled to Bank</p>
              <p className="text-2xl font-bold text-slate-200">₹3,42,800</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
