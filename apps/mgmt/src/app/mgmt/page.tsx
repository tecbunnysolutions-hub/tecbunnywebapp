"use client";

import React from 'react';
import { useAuth } from "@tecbunny/core/hooks";
import { 
  TrendingUp, Users, ShoppingCart, Activity, AlertCircle, 
  CheckCircle, Package, Clock, ShieldCheck
} from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass || 'bg-slate-50 text-slate-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' && 'rotate-180'}`} />
          {trendValue}
        </span>
        <span className="text-slate-400 ml-2">vs last week</span>
      </div>
    )}
  </div>
);

// Specific Dashboards based on roles
const SalesDashboard = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard title="My Pipeline" value="₹12.5L" icon={TrendingUp} trend="up" trendValue="+18%" colorClass="bg-blue-50 text-blue-600" />
      <KPICard title="Pending Quotations" value="14" icon={Clock} trend="down" trendValue="-2" colorClass="bg-amber-50 text-amber-600" />
      <KPICard title="Deals Won" value="8" icon={CheckCircle} trend="up" trendValue="+3" colorClass="bg-emerald-50 text-emerald-600" />
      <KPICard title="New Leads" value="24" icon={Users} trend="up" trendValue="+12%" colorClass="bg-indigo-50 text-indigo-600" />
    </div>
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-lg"><Activity className="w-6 h-6" /></div>
        <div>
          <h3 className="text-lg font-semibold">Gemini AI Assistant</h3>
          <p className="text-blue-100 mt-1">Focus on Quotation #QT-1029 (TechCorp). They have opened the PDF 3 times today and are highly likely to convert. Recommend offering a 5% bundle discount on accessories to close today.</p>
        </div>
      </div>
    </div>
  </>
);

const ServiceDashboard = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard title="Open Tickets" value="32" icon={AlertCircle} trend="down" trendValue="-15%" colorClass="bg-rose-50 text-rose-600" />
      <KPICard title="Engineers Active" value="12/15" icon={Users} colorClass="bg-blue-50 text-blue-600" />
      <KPICard title="Today's AMCs" value="8" icon={ShieldCheck} trend="up" trendValue="+2" colorClass="bg-emerald-50 text-emerald-600" />
      <KPICard title="Avg Resolution" value="4.2 hrs" icon={Clock} trend="up" trendValue="-30m" colorClass="bg-purple-50 text-purple-600" />
    </div>
    <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-lg"><Activity className="w-6 h-6" /></div>
        <div>
          <h3 className="text-lg font-semibold">Gemini AI Assistant</h3>
          <p className="text-rose-100 mt-1">Engineer Rahul is currently overloaded with 5 pending visits in South Zone. Consider reassigning Ticket #SR-882 to Amit, who is finishing a job 2km away.</p>
        </div>
      </div>
    </div>
  </>
);

export default function ManagementPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const isSales = user.role.includes('sales');
  const isService = user.role.includes('service');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500">Here's what requires your attention today.</p>
      </div>

      {isSales ? <SalesDashboard /> : isService ? <ServiceDashboard /> : (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border">
          <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Welcome to your Workspace</h3>
          <p>Your responsibility dashboard will appear here based on your assigned modules.</p>
        </div>
      )}

      {/* Common Feed/Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><CheckCircle className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Order #ORD-2099 approved</p>
                <p className="text-xs text-slate-500">By Admin • 10 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><AlertCircle className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-medium text-slate-900">New urgent support ticket #SR-112</p>
                <p className="text-xs text-slate-500">System • 45 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Tasks</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input type="checkbox" className="mt-1" />
              <span className="text-sm text-slate-700">Review monthly target reports</span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input type="checkbox" className="mt-1" />
              <span className="text-sm text-slate-700">Approve pending leave requests (2)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
