"use client";

import React from 'react';
import { TrendingUp, Users, ShoppingCart, Activity, AlertCircle, CheckCircle, Package, MessageSquare } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      {trend && (
        <p className={`text-sm mt-2 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' && 'rotate-180'}`} />
          {trendValue} vs last week
        </p>
      )}
    </div>
    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function SuperadminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here is what is happening across the entire organization today.</p>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            AI Business Insights
          </h2>
          <p className="mt-1 text-indigo-50">
            Revenue is down 12% because quotation conversion decreased in the Goa branch. We recommend triggering the "Win-Back" automation sequence for pending leads in that region.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Today's Revenue" value="₹2,45,000" icon={TrendingUp} trend="up" trendValue="+14%" />
        <KPICard title="Pending Orders" value="42" icon={ShoppingCart} trend="down" trendValue="-5%" />
        <KPICard title="Active Webchats" value="128" icon={MessageSquare} trend="up" trendValue="+22%" />
        <KPICard title="AI Resolved Tickets" value="89%" icon={CheckCircle} trend="up" trendValue="+4%" />
        <KPICard title="Inventory Alerts" value="12" icon={Package} trend="up" trendValue="+2 alerts" />
        <KPICard title="Engineers Busy" value="45/50" icon={Users} />
        <KPICard title="Payments Due" value="₹12.5L" icon={AlertCircle} trend="up" trendValue="+₹1.2L" />
        <KPICard title="Customer Satisfaction" value="4.8/5.0" icon={CheckCircle} trend="up" trendValue="+0.1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm h-80 flex flex-col items-center justify-center text-gray-400">
          <Activity className="w-12 h-12 mb-4 text-gray-300" />
          <p>Revenue & Profit Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm h-80 flex flex-col items-center justify-center text-gray-400">
          <Users className="w-12 h-12 mb-4 text-gray-300" />
          <p>Branch Performance Comparison Placeholder</p>
        </div>
      </div>
    </div>
  );
}
