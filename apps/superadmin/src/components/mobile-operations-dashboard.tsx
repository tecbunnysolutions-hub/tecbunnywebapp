'use client';

import * as React from 'react';
import { Phone, MessageCircle, Clock, TrendingUp, AlertCircle, User, ChevronRight } from 'lucide-react';
import { Card, Badge, Skeleton, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@tecbunny/ui';
import { 
  getLeadMetrics, 
  getHotLeadsPriorityQueue, 
  getRevenueMetrics,
  type LeadMetrics, 
  type HotLead,
  type RevenueMetrics 
} from '@/lib/lead-command-center-data';

export function MobileOperationsDashboard() {
  const [leadMetrics, setLeadMetrics] = React.useState<LeadMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = React.useState<RevenueMetrics | null>(null);
  const [hotLeads, setHotLeads] = React.useState<HotLead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLead, setSelectedLead] = React.useState<HotLead | null>(null);
  const [activeTab, setActiveTab] = React.useState<'home' | 'leads' | 'pipeline' | 'profile'>('home');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [metrics, revenue, leads] = await Promise.all([
          getLeadMetrics(),
          getRevenueMetrics(),
          getHotLeadsPriorityQueue(),
        ]);

        setLeadMetrics(metrics);
        setRevenueMetrics(revenue);
        setHotLeads(leads || []);
      } catch (error) {
        console.error('Error fetching mobile dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-48 mt-4" />
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <MobileHomeTab
        leadMetrics={leadMetrics}
        revenueMetrics={revenueMetrics}
        hotLeads={hotLeads}
        onSelectLead={setSelectedLead}
        onTabChange={setActiveTab}
        selectedLead={selectedLead}
      />
    );
  }

  if (activeTab === 'leads') {
    return (
      <MobileLeadsTab
        hotLeads={hotLeads}
        onSelectLead={setSelectedLead}
        onTabChange={setActiveTab}
        selectedLead={selectedLead}
      />
    );
  }

  if (activeTab === 'pipeline') {
    return (
      <MobilePipelineTab
        revenueMetrics={revenueMetrics}
        onTabChange={setActiveTab}
      />
    );
  }

  return (
    <MobileProfileTab onTabChange={setActiveTab} />
  );
}

function MobileHomeTab({
  leadMetrics,
  revenueMetrics,
  hotLeads,
  onSelectLead,
  onTabChange,
  selectedLead,
}: {
  leadMetrics: LeadMetrics | null;
  revenueMetrics: RevenueMetrics | null;
  hotLeads: HotLead[];
  onSelectLead: (lead: HotLead | null) => void;
  onTabChange: (tab: 'home' | 'leads' | 'pipeline' | 'profile') => void;
  selectedLead: HotLead | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-600/20 to-transparent p-4 pt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-zinc-400">Welcome</p>
            <h1 className="text-2xl font-bold text-white">TecBunny</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            SA
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-4 pt-2 space-y-3">
        {/* Hot Leads Card */}
        {leadMetrics && (
          <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-400 font-semibold">🔥 HOT LEADS</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{leadMetrics.hotLeads}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Pending follow-up</p>
                <p className="text-lg font-bold text-amber-400">{leadMetrics.pendingFollowup}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400">Contact within 10 minutes</p>
            <Button
              size="sm"
              className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onTabChange('leads')}
            >
              View Leads <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Pipeline Value Card */}
        {revenueMetrics && (
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4">
            <p className="text-xs text-zinc-400 font-semibold mb-2">💰 PIPELINE VALUE</p>
            <p className="text-2xl font-bold text-emerald-400">
              ₹{(revenueMetrics.pendingRevenue / 100000).toFixed(1)}L
            </p>
            <div className="flex gap-3 mt-3 text-xs">
              <div>
                <p className="text-zinc-500">Quotes Pending</p>
                <p className="font-semibold text-white">{revenueMetrics.pendingCount}</p>
              </div>
              <div className="border-l border-zinc-700" />
              <div>
                <p className="text-zinc-500">Won This Month</p>
                <p className="font-semibold text-emerald-400">₹{(revenueMetrics.paidRevenue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Summary */}
        {leadMetrics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400">New Leads Today</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{leadMetrics.todayLeads}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400">Avg Lead Score</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{Math.round(leadMetrics.avgLeadScore)}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400">Warm Leads</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{leadMetrics.warmLeads}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400">Conversions</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{leadMetrics.convertedLeads}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-3">
              <Phone size={18} />
              <span className="text-xs">Call</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-3">
              <MessageCircle size={18} />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-3">
              <Clock size={18} />
              <span className="text-xs">Schedule</span>
            </Button>
          </div>
        </div>
      </div>

      {/* First Hot Lead Preview */}
      {hotLeads.length > 0 && (
        <div className="px-4 mt-4 mb-8">
          <p className="text-xs font-semibold text-zinc-400 mb-2">Next Priority</p>
          <div
            className="bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/30 rounded-xl p-4 cursor-pointer hover:border-red-500/50 transition-colors"
            onClick={() => onSelectLead(hotLeads[0])}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-white">{hotLeads[0].name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{hotLeads[0].company}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-red-500/30 text-red-300 text-xs">
                    Score: {hotLeads[0].leadScore}
                  </Badge>
                  <Badge className="bg-amber-500/30 text-amber-300 text-xs">
                    ₹{(hotLeads[0].estimatedValue / 100000).toFixed(1)}L
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-400 font-semibold">URGENT</p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  Act Now <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => onSelectLead(null)} />
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="home" onTabChange={onTabChange} />
    </div>
  );
}

function MobileLeadsTab({
  hotLeads,
  onSelectLead,
  onTabChange,
  selectedLead,
}: {
  hotLeads: HotLead[];
  onSelectLead: (lead: HotLead | null) => void;
  onTabChange: (tab: 'home' | 'leads' | 'pipeline' | 'profile') => void;
  selectedLead: HotLead | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Hot Leads</h1>
        <p className="text-xs text-zinc-400">Tap to contact</p>
      </div>

      {/* Lead List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {hotLeads.map((lead, idx) => (
          <div
            key={lead.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-amber-500/30 transition-all"
            onClick={() => onSelectLead(lead)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-xs font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white">{lead.name}</h3>
                </div>
                <p className="text-xs text-zinc-400">{lead.company}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <Badge className="bg-red-500/20 text-red-300 text-xs">
                    {lead.leadScore}
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-300 text-xs">
                    ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                    {lead.source}
                  </Badge>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => onSelectLead(null)} />
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="leads" onTabChange={onTabChange} />
    </div>
  );
}

function MobilePipelineTab({
  revenueMetrics,
  onTabChange,
}: {
  revenueMetrics: RevenueMetrics | null;
  onTabChange: (tab: 'home' | 'leads' | 'pipeline' | 'profile') => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Pipeline</h1>
        <p className="text-xs text-zinc-400">Revenue forecast</p>
      </div>

      {/* Pipeline Cards */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {revenueMetrics && (
          <>
            {/* Pending Revenue */}
            <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/30 rounded-2xl p-4">
              <p className="text-xs text-amber-300 font-semibold mb-2">Quotes Pending</p>
              <p className="text-3xl font-bold text-amber-400">
                ₹{(revenueMetrics.pendingRevenue / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-zinc-400 mt-2">{revenueMetrics.pendingCount} quotes awaiting signature</p>
            </div>

            {/* Paid Revenue */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-2xl p-4">
              <p className="text-xs text-emerald-300 font-semibold mb-2">Won This Month</p>
              <p className="text-3xl font-bold text-emerald-400">
                ₹{(revenueMetrics.paidRevenue / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-zinc-400 mt-2">{revenueMetrics.paidCount} contracts signed</p>
            </div>

            {/* Today's Activity */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-400 font-semibold mb-3">Today</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-300">Revenue Booked</p>
                  <p className="font-bold text-emerald-400">
                    ₹{(revenueMetrics.todayRevenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-300">Orders Processed</p>
                  <p className="font-bold text-blue-400">{revenueMetrics.paymentCount}</p>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-400 font-semibold mb-3">This Week</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-300">Weekly Revenue</p>
                  <p className="font-bold text-emerald-400">
                    ₹{(revenueMetrics.weekRevenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-300">Conversion Rate</p>
                  <p className="font-bold text-amber-400">
                    {revenueMetrics.paymentCount > 0
                      ? ((revenueMetrics.paidCount / revenueMetrics.paymentCount) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="pipeline" onTabChange={onTabChange} />
    </div>
  );
}

function MobileProfileTab({
  onTabChange,
}: {
  onTabChange: (tab: 'home' | 'leads' | 'pipeline' | 'profile') => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            SA
          </div>
          <div>
            <p className="font-bold text-white">Sales Admin</p>
            <p className="text-xs text-zinc-400">superadmin@tecbunny.com</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400">Account Settings</p>
          <button className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition-colors">
            <p className="text-sm text-white">Session Timeout</p>
            <p className="text-xs text-zinc-400 mt-1">4 hours</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition-colors border-t border-zinc-700">
            <p className="text-sm text-white">Notifications</p>
            <p className="text-xs text-zinc-400 mt-1">Hot leads only</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition-colors border-t border-zinc-700">
            <p className="text-sm text-white">Language</p>
            <p className="text-xs text-zinc-400 mt-1">English</p>
          </button>
        </div>

        <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
          Sign Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="profile" onTabChange={onTabChange} />
    </div>
  );
}

function LeadDetailModal({
  lead,
  onClose,
}: {
  lead: HotLead;
  onClose: () => void;
}) {
  const handleContactMethod = (method: string) => {
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/${lead.company?.replace(/\D/g, '') || ''}`, '_blank');
        break;
      case 'call':
        window.location.href = 'tel:' + (lead.company?.replace(/\D/g, '') || '');
        break;
      case 'email':
        // Email would be implemented with lead details
        break;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bottom-0 rounded-t-2xl">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-zinc-900/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-zinc-400">Company</span>
              <span className="text-sm font-semibold text-white">{lead.company}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="text-xs text-zinc-400">Lead Score</span>
              <Badge className="bg-amber-500/20 text-amber-300">{lead.leadScore}/100</Badge>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="text-xs text-zinc-400">Estimated Value</span>
              <span className="text-sm font-semibold text-emerald-400">
                ₹{(lead.estimatedValue / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="text-xs text-zinc-400">Source</span>
              <span className="text-sm font-semibold text-white">{lead.source}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="text-xs text-zinc-400">Assigned To</span>
              <span className="text-sm font-semibold text-white">{lead.assignedToName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => handleContactMethod('whatsapp')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle size={16} className="mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleContactMethod('call')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Phone size={16} className="mr-2" />
              Call
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileBottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: 'home' | 'leads' | 'pipeline' | 'profile';
  onTabChange: (tab: 'home' | 'leads' | 'pipeline' | 'profile') => void;
}) {
  const isActive = (tab: string) => activeTab === tab;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 grid grid-cols-4 gap-1 p-2">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('home')
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <TrendingUp size={20} />
        <span className="text-xs font-semibold">Home</span>
      </button>
      <button
        onClick={() => onTabChange('leads')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('leads')
            ? 'bg-red-600/20 text-red-400'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <AlertCircle size={20} />
        <span className="text-xs font-semibold">Leads</span>
      </button>
      <button
        onClick={() => onTabChange('pipeline')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('pipeline')
            ? 'bg-emerald-600/20 text-emerald-400'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <TrendingUp size={20} />
        <span className="text-xs font-semibold">Pipeline</span>
      </button>
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('profile')
            ? 'bg-purple-600/20 text-purple-400'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <User size={20} />
        <span className="text-xs font-semibold">Profile</span>
      </button>
    </div>
  );
}
