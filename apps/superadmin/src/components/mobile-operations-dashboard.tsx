'use client';

import * as React from 'react';
import { Phone, MessageCircle, Clock, TrendingUp, AlertCircle, User, ChevronRight } from 'lucide-react';
import { Card, Badge, Skeleton, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@tecbunny/ui';
import { logger } from '@tecbunny/core';
import type { LeadMetrics, HotLead, RevenueMetrics } from '@tecbunny/contracts';
import { createBrowserApi } from '@/lib/api';

export function MobileOperationsDashboard() {
  const [leadMetrics, setLeadMetrics] = React.useState<LeadMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = React.useState<RevenueMetrics | null>(null);
  const [hotLeads, setHotLeads] = React.useState<HotLead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [selectedLead, setSelectedLead] = React.useState<HotLead | null>(null);
  const [activeTab, setActiveTab] = React.useState<'home' | 'leads' | 'pipeline' | 'profile'>('home');

  React.useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await createBrowserApi().superadmin.leadCommandCenter();
        const { leadMetrics: metrics, revenueMetrics: revenue, hotLeads: leads } = data;

        if (cancelled) return;
        setLeadMetrics(metrics);
        setRevenueMetrics(revenue);
        setHotLeads(leads || []);
      } catch (error) {
        if (cancelled) return;
        logger.error('Error fetching mobile dashboard', { error: error instanceof Error ? error.message : String(error) });
        setFetchError('Unable to load dashboard data. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-48 mt-4" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button onClick={() => setRetryCount((count) => count + 1)}>Retry</Button>
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
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-transparent p-4 pt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Welcome</p>
            <h1 className="text-2xl font-bold text-foreground">TecBunny</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            SA
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-4 pt-2 space-y-3">
        {/* Hot Leads Card */}
        {leadMetrics && (
          <div className="bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/30 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">🔥 HOT LEADS</p>
                <p className="text-3xl font-bold text-destructive mt-1">{leadMetrics.hotLeads}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Pending follow-up</p>
                <p className="text-lg font-bold text-warning">{leadMetrics.pendingFollowup}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Contact within 10 minutes</p>
            <Button
              size="sm"
              className="w-full mt-3 bg-destructive hover:bg-destructive text-destructive-foreground"
              onClick={() => onTabChange('leads')}
            >
              View Leads <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Pipeline Value Card */}
        {revenueMetrics && (
          <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">💰 PIPELINE VALUE</p>
            <p className="text-2xl font-bold text-success">
              ₹{(revenueMetrics.pendingRevenue / 100000).toFixed(1)}L
            </p>
            <div className="flex gap-3 mt-3 text-xs">
              <div>
                <p className="text-muted-foreground">Quotes Pending</p>
                <p className="font-semibold text-foreground">{revenueMetrics.pendingCount}</p>
              </div>
              <div className="border-l border-border" />
              <div>
                <p className="text-muted-foreground">Won This Month</p>
                <p className="font-semibold text-success">₹{(revenueMetrics.paidRevenue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Summary */}
        {leadMetrics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/50 border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">New Leads Today</p>
              <p className="text-2xl font-bold text-primary mt-1">{leadMetrics.todayLeads}</p>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Avg Lead Score</p>
              <p className="text-2xl font-bold text-warning mt-1">{Math.round(leadMetrics.avgLeadScore)}</p>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Warm Leads</p>
              <p className="text-2xl font-bold text-warning mt-1">{leadMetrics.warmLeads}</p>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold text-success mt-1">{leadMetrics.convertedLeads}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card/50 border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Actions</p>
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
          <p className="text-xs font-semibold text-muted-foreground mb-2">Next Priority</p>
          <div
            className="bg-gradient-to-br from-destructive/20 to-transparent border border-destructive/30 rounded-xl p-4 cursor-pointer hover:border-destructive/50 transition-colors"
            onClick={() => onSelectLead(hotLeads[0])}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{hotLeads[0].name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{hotLeads[0].company}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-destructive/30 text-destructive text-xs">
                    Score: {hotLeads[0].leadScore}
                  </Badge>
                  <Badge className="bg-warning/30 text-warning text-xs">
                    ₹{(hotLeads[0].estimatedValue / 100000).toFixed(1)}L
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-warning font-semibold">URGENT</p>
                <Button size="sm" className="mt-2 bg-destructive hover:bg-destructive text-destructive-foreground">
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
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Hot Leads</h1>
        <p className="text-xs text-muted-foreground">Tap to contact</p>
      </div>

      {/* Lead List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {hotLeads.map((lead, idx) => (
          <div
            key={lead.id}
            className="bg-card/50 border border-border rounded-xl p-4 cursor-pointer hover:border-warning/30 transition-all"
            onClick={() => onSelectLead(lead)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-card text-xs font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-foreground">{lead.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{lead.company}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <Badge className="bg-destructive/20 text-destructive text-xs">
                    {lead.leadScore}
                  </Badge>
                  <Badge className="bg-warning/20 text-warning text-xs">
                    ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                  </Badge>
                  <Badge className="bg-primary/20 text-primary text-xs">
                    {lead.source}
                  </Badge>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
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
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
        <p className="text-xs text-muted-foreground">Revenue forecast</p>
      </div>

      {/* Pipeline Cards */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {revenueMetrics && (
          <>
            {/* Pending Revenue */}
            <div className="bg-gradient-to-br from-warning/20 to-transparent border border-warning/30 rounded-2xl p-4">
              <p className="text-xs text-warning font-semibold mb-2">Quotes Pending</p>
              <p className="text-3xl font-bold text-warning">
                ₹{(revenueMetrics.pendingRevenue / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-muted-foreground mt-2">{revenueMetrics.pendingCount} quotes awaiting signature</p>
            </div>

            {/* Paid Revenue */}
            <div className="bg-gradient-to-br from-success/20 to-transparent border border-success/30 rounded-2xl p-4">
              <p className="text-xs text-success font-semibold mb-2">Won This Month</p>
              <p className="text-3xl font-bold text-success">
                ₹{(revenueMetrics.paidRevenue / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-muted-foreground mt-2">{revenueMetrics.paidCount} contracts signed</p>
            </div>

            {/* Today's Activity */}
            <div className="bg-card/50 border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-3">Today</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Revenue Booked</p>
                  <p className="font-bold text-success">
                    ₹{(revenueMetrics.todayRevenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Orders Processed</p>
                  <p className="font-bold text-primary">{revenueMetrics.paymentCount}</p>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-card/50 border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-3">This Week</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                  <p className="font-bold text-success">
                    ₹{(revenueMetrics.weekRevenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="font-bold text-warning">
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
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-xl">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            SA
          </div>
          <div>
            <p className="font-bold text-foreground">Sales Admin</p>
            <p className="text-xs text-muted-foreground">superadmin@tecbunny.com</p>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">Account Settings</p>
          <button className="w-full text-left p-3 hover:bg-card rounded-lg transition-colors">
            <p className="text-sm text-foreground">Session Timeout</p>
            <p className="text-xs text-muted-foreground mt-1">4 hours</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-card rounded-lg transition-colors border-t border-border">
            <p className="text-sm text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground mt-1">Hot leads only</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-card rounded-lg transition-colors border-t border-border">
            <p className="text-sm text-foreground">Language</p>
            <p className="text-xs text-muted-foreground mt-1">English</p>
          </button>
        </div>

        <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
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
          <div className="bg-card/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Company</span>
              <span className="text-sm font-semibold text-foreground">{lead.company}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Lead Score</span>
              <Badge className="bg-warning/20 text-warning">{lead.leadScore}/100</Badge>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Estimated Value</span>
              <span className="text-sm font-semibold text-success">
                ₹{(lead.estimatedValue / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Source</span>
              <span className="text-sm font-semibold text-foreground">{lead.source}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Assigned To</span>
              <span className="text-sm font-semibold text-foreground">{lead.assignedToName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => handleContactMethod('whatsapp')}
              className="w-full bg-success hover:bg-success text-success-foreground"
            >
              <MessageCircle size={16} className="mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleContactMethod('call')}
              className="w-full bg-primary hover:bg-primary text-primary-foreground"
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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border grid grid-cols-4 gap-1 p-2">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('home')
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <TrendingUp size={20} />
        <span className="text-xs font-semibold">Home</span>
      </button>
      <button
        onClick={() => onTabChange('leads')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('leads')
            ? 'bg-destructive/20 text-destructive'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <AlertCircle size={20} />
        <span className="text-xs font-semibold">Leads</span>
      </button>
      <button
        onClick={() => onTabChange('pipeline')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('pipeline')
            ? 'bg-success/20 text-success'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <TrendingUp size={20} />
        <span className="text-xs font-semibold">Pipeline</span>
      </button>
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
          isActive('profile')
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User size={20} />
        <span className="text-xs font-semibold">Profile</span>
      </button>
    </div>
  );
}
