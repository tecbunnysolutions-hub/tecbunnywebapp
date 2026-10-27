'use client';

import * as React from 'react';
import { TrendingUp, AlertCircle, Activity, Zap } from 'lucide-react';
import { Card, Badge, Skeleton, useToast } from '@tecbunny/ui';

interface SourceAnalytics {
  source: string;
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  hotPercentage: number;
  avgLeadScore: number;
  conversationRate: number;
  whatsappClicks: number;
  phoneClicks: number;
  assessmentSubmissions: number;
}

interface SourceDashboardData {
  success: boolean;
  summary: {
    totalAssessments: number;
    assessmentsThisWeek: number;
    avgLeadScore: number;
    totalSources: number;
    hotPercentage: number;
  };
  sourcePerformance: SourceAnalytics[];
  topConvertingSource: SourceAnalytics | null;
}

export function SourceAnalyticsDashboard() {
  const [data, setData] = React.useState<SourceDashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/marketing/source-analytics');
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching source analytics:', error);
        toast({
          variant: 'destructive',
          title: 'Error Loading Dashboard',
          description: 'Could not fetch source analytics data',
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
        <div className="grid gap-4 sm:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!data?.success) {
    return (
      <Card className="p-6 border-destructive/50">
        <div className="flex gap-3">
          <AlertCircle className="text-destructive" size={20} />
          <div>
            <h3 className="font-semibold">Unable to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground">Please try again or contact support.</p>
          </div>
        </div>
      </Card>
    );
  }

  const { summary, sourcePerformance, topConvertingSource } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="p-5 bg-gradient-to-br from-primary/10 via-transparent border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Assessments</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary.totalAssessments}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.assessmentsThisWeek} this week</p>
            </div>
            <Activity className="text-primary" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-success/10 via-transparent border-success/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HOT Leads</p>
              <p className="text-3xl font-bold text-success mt-2">{summary.hotPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">of all submissions</p>
            </div>
            <Zap className="text-success" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-warning/10 via-transparent border-warning/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Lead Score</p>
              <p className="text-3xl font-bold text-warning mt-2">{summary.avgLeadScore}</p>
              <p className="text-xs text-muted-foreground mt-1">out of 100</p>
            </div>
            <TrendingUp className="text-warning" size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-primary/10 via-transparent border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Traffic Sources</p>
              <p className="text-3xl font-bold text-primary mt-2">{summary.totalSources}</p>
              <p className="text-xs text-muted-foreground mt-1">channels tracked</p>
            </div>
            <Activity className="text-primary" size={20} />
          </div>
        </Card>

        {topConvertingSource && (
          <Card className="p-5 bg-gradient-to-br from-primary/10 via-transparent border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Source</p>
                <p className="text-lg font-bold text-primary mt-2 capitalize">{topConvertingSource.source}</p>
                <p className="text-xs text-muted-foreground mt-1">{topConvertingSource.hotPercentage}% HOT</p>
              </div>
              <TrendingUp className="text-primary" size={20} />
            </div>
          </Card>
        )}
      </div>

      {/* Source Performance Table */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity size={16} />
          Performance by Source
        </h3>

        {sourcePerformance.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No data available yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Source</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">HOT</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">WARM</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">HOT %</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Avg Score</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Conv. Rate</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground">WhatsApp Clicks</th>
                </tr>
              </thead>
              <tbody>
                {sourcePerformance.map((source) => (
                  <tr key={source.source} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground capitalize">{source.source}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{source.totalLeads}</td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-success/15 border-success/30 text-success text-xs">
                        {source.hotLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className="bg-warning/15 border-warning/30 text-warning text-xs">
                        {source.warmLeads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className="font-semibold text-success">{source.hotPercentage}%</span>
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{source.avgLeadScore}</td>
                    <td className="text-center py-3 px-3">
                      <span className="font-medium text-primary">{source.conversationRate}%</span>
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{source.whatsappClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Insights */}
      <Card className="p-6 border-primary/20 bg-primary/5">
        <h4 className="text-sm font-bold text-foreground mb-3">Key Insights</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {topConvertingSource && (
            <li>✓ <strong className="text-foreground">{topConvertingSource.source.toUpperCase()}</strong> is your best-converting source with <strong className="text-success">{topConvertingSource.hotPercentage}%</strong> HOT leads</li>
          )}
          <li>✓ Average lead quality: <strong className="text-warning">{summary.avgLeadScore}/100</strong></li>
          <li>✓ <strong className="text-foreground">{summary.hotPercentage}%</strong> of assessed leads qualify as HOT priority</li>
          {sourcePerformance.length > 1 && (
            <li>✓ You're tracking leads from <strong className="text-foreground">{summary.totalSources}</strong> different sources</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
