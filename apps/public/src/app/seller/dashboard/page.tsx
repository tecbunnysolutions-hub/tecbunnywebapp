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
    <div className="min-h-screen min-w-0 bg-background text-muted-foreground p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex min-w-0 items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Your seller workspace</h1>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
              <span>Example seller account</span>
              <span>•</span>
              <span className="text-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sample account
              </span>
              <span>•</span>
              <span className="text-primary font-medium">Workspace preview</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className="px-4 py-2 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-primary/30"
          >
            <PlusCircle className="w-4 h-4" /> Preview a draft
          </button>
        </div>
      </div>

      <p role="note" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">This workspace shows sample data. Changes here are not saved.</p>

      {/* Tabs */}
      <div className="flex max-w-full items-center gap-2 overflow-x-auto border-b border-border pb-2">
        {(['OVERVIEW', 'PRODUCTS', 'ORDERS', 'SETTLEMENTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-muted-foreground hover:bg-card'
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
            <div className="bg-card border border-border p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase">Available Settlement Balance</p>
              <p className="text-2xl font-bold text-success mt-1">₹48,250</p>
              <p className="text-[11px] text-muted-foreground mt-1">Post-return window release</p>
            </div>
            <div className="bg-card border border-warning/20 p-5 rounded-xl">
              <p className="text-xs font-medium text-warning uppercase">Pending Settlement Balance</p>
              <p className="text-2xl font-bold text-warning mt-1">₹24,500</p>
              <p className="text-[11px] text-muted-foreground mt-1">Awaiting 7-day return expiration</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase">Assigned Orders</p>
              <p className="text-2xl font-bold text-foreground mt-1">{orders.length}</p>
              <p className="text-[11px] text-primary mt-1">Ready for pickup: {orders.filter(o => o.status === 'READY_FOR_PICKUP').length}</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase">Seller Quality Score</p>
              <p className="text-2xl font-bold text-primary mt-1">98.4 / 100</p>
              <p className="text-[11px] text-success mt-1">On-Time Pickup SLA: 99.1%</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Pending Pickup Orders ("Ready for Pickup" SLA Workflow)
            </h3>
            <div className="divide-y divide-border">
              {orders.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-muted-foreground">{ord.productName}</div>
                    <div className="text-xs text-muted-foreground">Order: {ord.orderNumber} • Qty: {ord.qty} • SKU: {ord.sku}</div>
                    <div className="text-xs font-semibold text-success mt-1">Agreed Wholesale Purchase Price: ₹{ord.sellerPurchasePrice}</div>
                  </div>
                  <div>
                    {ord.status === 'READY_FOR_PICKUP' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Pickup (TecBunny Dispatch)
                      </span>
                    ) : (
                      <button
                        onClick={() => markReadyForPickup(ord.id)}
                        className="px-4 py-2 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-semibold text-xs transition shadow-lg shadow-primary/30"
                      >
                        Mark sample ready
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
        <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Preview a product draft
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Try the draft fields with example values. This preview does not submit a product for review.
            </p>
          </div>

          {productCreated && (
            <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Draft preview complete. This draft has not been saved or submitted for review.
            </div>
          )}

          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div>
              <label htmlFor="app-seller-dashboard-page-product-title" className="block text-xs font-semibold text-muted-foreground">Product Title</label>
              <input id="app-seller-dashboard-page-product-title"
                type="text"
                required
                placeholder="e.g. 8-Channel PoE CCTV NVR Recorder"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="app-seller-dashboard-page-sku-model-number" className="block text-xs font-semibold text-muted-foreground">SKU / Model Number</label>
                <input id="app-seller-dashboard-page-sku-model-number"
                  type="text"
                  required
                  placeholder="NVR-8CH-POE"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                />
              </div>
              <div>
                <label htmlFor="app-seller-dashboard-page-category" className="block text-xs font-semibold text-muted-foreground">Category</label>
                <select id="app-seller-dashboard-page-category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
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
                <label htmlFor="app-seller-dashboard-page-seller-purchase-price" className="block text-xs font-bold text-success">Seller Purchase Price (₹)</label>
                <input id="app-seller-dashboard-page-seller-purchase-price"
                  type="number"
                  required
                  placeholder="1200"
                  value={newProduct.sellerPurchasePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellerPurchasePrice: e.target.value })}
                  className="w-full bg-card border border-success/40 rounded-lg px-4 py-2 text-sm font-bold text-success focus:outline-none focus:ring-2 focus:ring-success mt-1"
                />
              </div>
              <div>
                <label htmlFor="app-seller-dashboard-page-mrp" className="block text-xs font-semibold text-muted-foreground">MRP (₹)</label>
                <input id="app-seller-dashboard-page-mrp"
                  type="number"
                  required
                  placeholder="2400"
                  value={newProduct.mrp}
                  onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                />
              </div>
              <div>
                <label htmlFor="app-seller-dashboard-page-initial-stock-quantity" className="block text-xs font-semibold text-muted-foreground">Initial Stock Quantity</label>
                <input id="app-seller-dashboard-page-initial-stock-quantity"
                  type="number"
                  required
                  placeholder="50"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/30 transition text-sm"
            >
              Preview product draft
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'ORDERS' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Assigned Marketplace Orders</h2>
          <div className="divide-y divide-border">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-muted-foreground">{ord.productName}</div>
                  <div className="text-xs text-muted-foreground">Ref: {ord.orderNumber} • Qty: {ord.qty} • Created: {ord.createdAt}</div>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
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
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-success" />
            Wallet Ledger & Financial Settlements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/60 p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-success">₹48,250</p>
            </div>
            <div className="bg-card/60 p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Pending Balance</p>
              <p className="text-2xl font-bold text-warning">₹24,500</p>
            </div>
            <div className="bg-card/60 p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Total Settled to Bank</p>
              <p className="text-2xl font-bold text-muted-foreground">₹3,42,800</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

