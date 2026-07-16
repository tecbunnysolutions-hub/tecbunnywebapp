"use client";

import React, { useState } from 'react';
import { Package, Search, Plus, Filter, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useGlobalDrawer } from '@tecbunny/core';

// The Tabbed UI that renders INSIDE the Drawer
function ProductEditor() {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="flex flex-col h-full -mx-6 -mt-4 px-6">
      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="py-6 flex-1">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2" placeholder="e.g. TecBunny Router Pro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea className="w-full border border-slate-300 rounded-lg p-2 h-32" placeholder="Detailed product description..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full border border-slate-300 rounded-lg p-2">
                  <option>Networking</option>
                  <option>Hardware</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full border border-slate-300 rounded-lg p-2">
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                <input type="number" className="w-full border border-slate-300 rounded-lg p-2" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compare at Price (₹)</label>
                <input type="number" className="w-full border border-slate-300 rounded-lg p-2" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (₹)</label>
                <input type="number" className="w-full border border-slate-300 rounded-lg p-2" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                <input type="number" className="w-full border border-slate-300 rounded-lg p-2" placeholder="18" />
              </div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-4 rounded-lg text-sm mt-4">
              <strong>Calculated Margin:</strong> 24% (₹450 profit per unit)
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4 text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Advanced Branch Inventory tracking will appear here.</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 mt-auto">
        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Product</button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { openDrawer } = useGlobalDrawer();

  const handleEditProduct = (name: string) => {
    openDrawer(`Edit: ${name}`, <ProductEditor />, 'lg');
  };

  const handleNewProduct = () => {
    openDrawer('Create New Product', <ProductEditor />, 'lg');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-slate-500 mt-1">Manage variants, bundles, and pricing across all branches.</p>
        </div>
        <button 
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search products, SKUs, barcodes..." className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[1,2,3,4,5].map((i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleEditProduct(`TecBunny Product ${i}`)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">TecBunny Product {i}</div>
                      <div className="text-sm text-slate-500">SKU: TB-PRD-00{i}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">₹1,200.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">45 units</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEditProduct(`TecBunny Product ${i}`)} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-rose-600 hover:bg-rose-50 p-1.5 rounded">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
