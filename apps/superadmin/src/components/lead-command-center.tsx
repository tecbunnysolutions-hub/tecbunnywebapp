'use client';

import * as React from 'react';
import { TrendingUp, AlertCircle, Activity, Zap, Clock, Target, Users, ArrowRight } from 'lucide-react';
import { Card, Badge, Skeleton, useToast, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@tecbunny/ui';
import type { LeadMetrics, HotLead, LeadAssignmentStatus } from '@tecbunny/contracts';
import { createBrowserApi } from '@/lib/api';

export function LeadCommandCenter() {
  const [leadMetrics, setLeadMetrics] = React.useState<LeadMetrics | null>(null);
  const [hotLeads, setHotLeads] = React.useState<HotLead[]>([]);
  const [sourcePerformance, setSourcePerformance] = React.useState<any[]>([]);
  const [assignmentStatus, setAssignmentStatus] = React.useState<LeadAssignmentStatus[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLead, setSelectedLead] = React.useState<HotLead | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await createBrowserApi().superadmin.leadCommandCenter();
        const { leadMetrics: metrics, hotLeads: leads, sourcePerformance: sources, assignmentStatus: assignments } = data;

        setLeadMetrics(metrics);
        setHotLeads(leads || []);
        setSourcePerformance(sources || []);
        setAssignmentStatus(assignments || []);
      } catch (error) {
        console.error('Error fetching lead command center data:', error);
        toast({
          variant: 'destructive',
          title: 'Error Loading Data',
          description: 'Could not fetch lead metrics',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!leadMetrics) {
    return (
      <Card className="p-6 border-destructive/50">
        <div className="flex gap-3">
          <AlertCircle className="text-destructive" size={20} />
          <div>
            <h3 className="font-semibold">Unable to Load Lead Command Center</h3>
            <p className="text-sm text-muted-foreground">Please try again or contact support.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5 bg-gradient-to-br from-destructive/10 via-transparent border-destructive/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🔥 Hot Leads</p>
              <p className="text-3xl font-bold text-destructive mt-2">{leadMetrics.hotLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">Contact within 10 min</p>
            </div>
            <AlertCircle className="text-destructive" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-warning/10 via-transparent border-warning/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">⚡ Warm Leads</p>
              <p className="text-3xl font-bold text-warning mt-2">{leadMetrics.warmLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">Follow up today</p>
            </div>
            <Zap className="text-warning" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-primary/10 via-transparent border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Leads</p>
              <p className="text-3xl font-bold text-primary mt-2">{leadMetrics.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg score {Math.round(leadMetrics.avgLeadScore)}</p>
            </div>
            <Target className="text-primary" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-success/10 via-transparent border-success/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversions</p>
              <p className="text-3xl font-bold text-success mt-2">{leadMetrics.convertedLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <TrendingUp className="text-success" size={20} />
          </div>
        </Card>
      </div>

      {/* Hot Leads Priority Queue */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-destructive" />
          🔥 Immediate Action Required ({leadMetrics.pendingFollowup} pending follow-ups)
        </h3>

        {hotLeads.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No hot leads requiring follow-up</p>
        ) : (
          <div className="space-y-3">
            {hotLeads.slice(0, 10).map((lead) => (
              <div
                key={lead.id}
                className="flex items-start justify-between p-4 rounded-lg bg-card/50 border border-destructive/30 hover:border-destructive/50 transition-colors cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{lead.name}</h4>
                    <Badge className="bg-destructive/20 text-destructive text-xs">Score: {lead.leadScore}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.company}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>💰 ₹{(lead.estimatedValue / 100000).toFixed(1)}L</span>
                    <span>📍 {lead.source}</span>
                    <span>👤 {lead.assignedToName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-warning mb-1">
                    {lead.nextFollowupAt && new Date(lead.nextFollowupAt) <= new Date()
                      ? 'URGENT'
                      : lead.nextFollowupAt
                        ? `${Math.round((new Date(lead.nextFollowupAt).getTime() - Date.now()) / 3600000)}h`
                        : 'Pending'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-warning/30 text-warning hover:bg-warning/10"
                  >
                    Follow Up <ArrowRight size={12} className="ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedLead.name}</DialogTitle>
                <DialogDescription>{selectedLead.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Lead Score</p>
                    <p className="text-2xl font-bold text-warning">{selectedLead.leadScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Value</p>
                    <p className="text-2xl font-bold text-success">₹{(selectedLead.estimatedValue / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="text-sm font-semibold">{selectedLead.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-semibold">{selectedLead.assignedToName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Contact</p>
                    <p className="text-sm font-semibold">
                      {selectedLead.lastContactAt
                        ? new Date(selectedLead.lastContactAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className="mt-1">{selectedLead.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-success hover:bg-success text-success-foreground">
                    📞 Call
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary text-primary-foreground">
                    💬 WhatsApp
                  </Button>
                  <Button className="flex-1" variant="outline">
                    📧 Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>

      {/* Lead Source Performance */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity size={16} />
          Lead Source Performance
        </h3>

        {sourcePerformance.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Source</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">🔥 Hot</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">⚡ Warm</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Avg Score</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {sourcePerformance.map((source) => (
                  <tr key={source.source} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground capitalize">{source.source}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{source.totalLeads}</td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-destructive/15 border-destructive/30 text-destructive text-xs">
                        {source.hotLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-warning/15 border-warning/30 text-warning text-xs">
                        {source.warmLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{source.avgScore}</td>
                    <td className="text-center py-3 px-3">
                      <span className="font-medium text-success">{source.conversionRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Team Workload Distribution */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Users size={16} />
          Team Workload Distribution
        </h3>

        {assignmentStatus.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No assignments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Sales Person</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Total Assigned</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">🔥 Hot</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">⚡ Warm</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Won</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">⏰ Pending</th>
                </tr>
              </thead>
              <tbody>
                {assignmentStatus.map((person) => (
                  <tr key={person.assignedTo} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground">{person.assignedToName}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{person.totalAssigned}</td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-destructive/15 border-destructive/30 text-destructive text-xs">
                        {person.hotLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-warning/15 border-warning/30 text-warning text-xs">
                        {person.warmLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-success/15 border-success/30 text-success text-xs">
                        {person.converted}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3 text-warning font-semibold">{person.pendingFollowup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Insights */}
      <Card className="p-6 border-primary/20 bg-primary/5">
        <h4 className="text-sm font-bold text-foreground mb-3">🎯 Command Center Insights</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>✓ <strong className="text-foreground">{leadMetrics.pendingFollowup} leads</strong> require immediate follow-up</li>
          <li>✓ <strong className="text-destructive">{leadMetrics.hotLeads} hot leads</strong> with average score <strong className="text-warning">{Math.round(leadMetrics.avgLeadScore)}</strong></li>
          <li>✓ <strong className="text-success">{leadMetrics.convertedLeads} conversions</strong> tracked this month</li>
          <li>✓ <strong className="text-foreground">{leadMetrics.todayLeads} new leads</strong> received today</li>
        </ul>
      </Card>
    </div>
  );
}
