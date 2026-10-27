'use client';

import * as React from 'react';
import {
  TrendingUp, RefreshCw, AlertCircle, CheckCircle2, Users, Activity, Zap
} from 'lucide-react';
import { Card, Button, Badge, Skeleton, useToast } from '@tecbunny/ui';

interface FunnelAnalytics {
  success: boolean;
  summary: {
    totalAssessments: number;
    assessmentsLast7Days: number;
    avgLeadScore: number;
    hotPercentage: number;
    hotCount: number;
    warmCount: number;
    coldCount: number;
  };
  priorityBreakdown: Record<string, number>;
  scoreDistribution: Record<string, number>;
  serviceBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  serviceMetrics: Array<{
    service: string;
    total: number;
    hot: number;
    warm: number;
    hotConversionRate: number;
  }>;
  dailyTrend: Array<{
    date: string;
    total: number;
    hot: number;
    warm: number;
    cold: number;
  }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  detail?: string;
  color: 'red' | 'amber' | 'blue' | 'emerald';
}) {
  const colorClasses = {
    red: 'bg-destructive/10 text-destructive border-destructive/20',
    amber: 'bg-warning/10 text-warning border-warning/20',
    blue: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-success/10 text-success border-success/20',
  };
  const iconBgClasses = {
    red: 'bg-destructive/10 text-destructive',
    amber: 'bg-warning/10 text-warning',
    blue: 'bg-primary/10 text-primary',
    emerald: 'bg-success/10 text-success',
  };

  return (
    <Card className={`p-4 border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {detail && <p className="text-xs mt-1 opacity-75">{detail}</p>}
        </div>
        <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function PriorityBreakdownCard({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const items = [
    { label: 'HOT', count: data.HOT || 0, color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' },
    { label: 'WARM', count: data.WARM || 0, color: 'bg-warning text-warning-foreground', textColor: 'text-warning' },
    { label: 'COLD', count: data.COLD || 0, color: 'bg-primary text-primary-foreground', textColor: 'text-primary' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp size={16} />
        Lead Priority Breakdown
      </h3>
      <div className="space-y-4">
        {items.map(item => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className={`text-xs font-semibold ${item.textColor}`}>{item.label}</span>
                <span className="text-xs font-mono text-muted-foreground">{item.count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>{total}</strong> total assessments in period
        </p>
      </div>
    </Card>
  );
}

function ServicePerformanceCard({
  metrics,
}: {
  metrics: Array<{
    service: string;
    total: number;
    hot: number;
    warm: number;
    hotConversionRate: number;
  }>;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap size={16} />
        Service Performance
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {metrics.length === 0 ? (
          <p className="text-xs text-muted-foreground">No service data</p>
        ) : (
          metrics.map(metric => (
            <div
              key={metric.service}
              className="p-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-foreground truncate max-w-xs">
                  {metric.service}
                </span>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                  {metric.hotConversionRate}% HOT
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-destructive">
                  <strong>{metric.hot}</strong> HOT
                </span>
                <span className="text-warning">
                  <strong>{metric.warm}</strong> WARM
                </span>
                <span className="text-muted-foreground">
                  <strong>{metric.total}</strong> Total
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function DailyTrendCard({
  data,
}: {
  data: Array<{
    date: string;
    total: number;
    hot: number;
    warm: number;
    cold: number;
  }>;
}) {
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp size={16} />
        30-Day Trend
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {data.map(day => {
          const percentage = (day.total / maxTotal) * 100;
          return (
            <div key={day.date}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-mono text-muted-foreground">{day.date}</span>
                <span className="text-xs text-muted-foreground">
                  <span className="text-destructive">●</span> {day.hot}{' '}
                  <span className="text-warning">●</span> {day.warm}{' '}
                  <span className="text-primary">●</span> {day.cold}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                {day.total > 0 && (
                  <>
                    {day.hot > 0 && (
                      <div
                        className="bg-destructive h-full text-destructive-foreground"
                        style={{ width: `${(day.hot / day.total) * 100}%` }}
                      />
                    )}
                    {day.warm > 0 && (
                      <div
                        className="bg-warning h-full text-warning-foreground"
                        style={{ width: `${(day.warm / day.total) * 100}%` }}
                      />
                    )}
                    {day.cold > 0 && (
                      <div
                        className="bg-primary h-full text-primary-foreground"
                        style={{ width: `${(day.cold / day.total) * 100}%` }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function FunnelAnalyticsDashboard() {
  const { toast } = useToast();
  const [data, setData] = React.useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/sales/funnel-analytics');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }
      const analytics = await response.json();
      setData(analytics);
    } catch (err: any) {
      const message = err.message || 'Failed to load funnel analytics';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Failed to Load Analytics',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (error && !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-destructive" size={24} />
            <div>
              <h3 className="font-semibold text-destructive">Analytics Error</h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessment Funnel Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time lead qualification metrics and conversion performance
          </p>
        </div>
        <Button
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </Card>
            ))}
          </>
        ) : data ? (
          <>
            <StatCard
              icon={Users}
              label="Total Assessments (30d)"
              value={data.summary.totalAssessments}
              detail={`${data.summary.assessmentsLast7Days} in last 7 days`}
              color="blue"
            />
            <StatCard
              icon={Zap}
              label="HOT Leads"
              value={data.summary.hotCount}
              detail={`${data.summary.hotPercentage}% of total`}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="WARM Leads"
              value={data.summary.warmCount}
              detail="Qualified projects"
              color="amber"
            />
            <StatCard
              icon={CheckCircle2}
              label="Avg Lead Score"
              value={`${data.summary.avgLeadScore}/100`}
              detail="Overall assessment quality"
              color="emerald"
            />
          </>
        ) : null}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Card className="p-6">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </Card>
          </>
        ) : data ? (
          <>
            <PriorityBreakdownCard data={data.priorityBreakdown} />
            <ServicePerformanceCard metrics={data.serviceMetrics} />
          </>
        ) : null}
      </div>

      {/* Trend */}
      <div>
        {loading ? (
          <Card className="p-6">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </Card>
        ) : data ? (
          <DailyTrendCard data={data.dailyTrend} />
        ) : null}
      </div>

      {/* Source Breakdown */}
      {!loading && data && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity size={16} />
            Lead Source Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data.sourceBreakdown).map(([source, count]) => (
              <div key={source} className="p-3 border border-border rounded-lg text-center">
                <p className="text-xs font-semibold text-foreground truncate">{source}</p>
                <p className="text-lg font-bold text-foreground mt-1">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
