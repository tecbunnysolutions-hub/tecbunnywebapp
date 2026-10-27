"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from "@tecbunny/core/hooks";
import {
  TrendingUp, Users, ShoppingCart, Activity, AlertCircle,
  CheckCircle, Package, Clock, ShieldCheck, RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type MetricTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
type MetricIcon = 'trending' | 'users' | 'orders' | 'package' | 'clock' | 'shield' | 'alert';

type DashboardMetric = {
  title: string;
  value: string;
  detail: string;
  tone: MetricTone;
  icon: MetricIcon;
};

type DashboardActivity = {
  id: string;
  title: string;
  detail: string;
  date: string;
  type: 'order' | 'lead' | 'ticket';
};

type DashboardTask = {
  label: string;
  href: string;
  priority: 'high' | 'medium' | 'normal';
};

type DashboardPayload = {
  track: 'sales' | 'service' | 'general';
  metrics: DashboardMetric[];
  activities: DashboardActivity[];
  tasks: DashboardTask[];
  generatedAt: string;
};

const TONE_CLASSES: Record<MetricTone, string> = {
  blue: 'bg-primary/10 text-primary',
  emerald: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  rose: 'bg-destructive/10 text-destructive',
  indigo: 'bg-primary/10 text-primary',
  slate: 'bg-muted text-muted-foreground',
};

const ICONS: Record<MetricIcon, LucideIcon> = {
  trending: TrendingUp,
  users: Users,
  orders: ShoppingCart,
  package: Package,
  clock: Clock,
  shield: ShieldCheck,
  alert: AlertCircle,
};

const ACTIVITY_ICONS: Record<DashboardActivity['type'], LucideIcon> = {
  order: CheckCircle,
  lead: Users,
  ticket: AlertCircle,
};

const ACTIVITY_COLORS: Record<DashboardActivity['type'], string> = {
  order: 'bg-primary/10 text-primary',
  lead: 'bg-primary/10 text-primary',
  ticket: 'bg-destructive/10 text-destructive',
};

const PRIORITY_CLASSES: Record<DashboardTask['priority'], string> = {
  high: 'border-destructive/20 bg-destructive/10 text-destructive',
  medium: 'border-warning/20 bg-warning/10 text-warning',
  normal: 'border-border bg-muted text-foreground',
};

function formatRelativeTime(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return 'Recently';
  const seconds = Math.max(1, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const KPICard = ({ metric }: { metric: DashboardMetric }) => {
  const Icon = ICONS[metric.icon];
  return (
  <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{metric.value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${TONE_CLASSES[metric.tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="mt-4 text-sm text-muted-foreground">{metric.detail}</p>
  </div>
  );
};

function MetricSkeleton() {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-8 w-20 rounded bg-muted" />
        </div>
        <div className="h-11 w-11 rounded-lg bg-muted" />
      </div>
      <div className="mt-4 h-4 w-40 rounded bg-muted" />
    </div>
  );
}

export default function ManagementPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = React.useState<DashboardPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/mgmt/overview', { signal, cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to load management overview');
      }
      setDashboard(payload as DashboardPayload);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Unable to load management overview');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    void loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard, user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground">Live operational summary for your assigned workspace.</p>
          {dashboard?.generatedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">Updated {formatRelativeTime(dashboard.generatedAt)}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => loadDashboard()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Dashboard data could not be loaded.</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }, (_, index) => <MetricSkeleton key={index} />)
          : (dashboard?.metrics ?? []).map((metric) => <KPICard key={metric.title} metric={metric} />)}
      </div>

      <div className="bg-gradient-to-r from-card to-primary rounded-xl p-6 text-foreground shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-card/15 rounded-lg"><Activity className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-semibold">Operational Focus</h3>
            <p className="text-primary mt-1">
              {dashboard?.tasks.length
                ? `${dashboard.tasks[0].label}. Use the action queue below to jump directly into the responsible module.`
                : 'No urgent action queue is currently active for this workspace.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 py-3 border-b border-border">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboard?.activities.length ? (
            <div className="space-y-4">
              {dashboard.activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ACTIVITY_COLORS[activity.type]}`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.detail} · {formatRelativeTime(activity.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              No recent order, lead, or service activity was found.
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Action Queue</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-12 rounded-lg bg-muted" />
              ))}
            </div>
          ) : dashboard?.tasks.length ? (
            <div className="space-y-3">
              {dashboard.tasks.map((task) => (
                <Link
                  key={`${task.href}-${task.label}`}
                  href={task.href}
                  className={`block rounded-lg border px-3 py-3 text-sm font-medium transition hover:shadow-sm ${PRIORITY_CLASSES[task.priority]}`}
                >
                  {task.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-success" />
              <p className="text-sm font-medium text-foreground">No urgent tasks</p>
              <p className="mt-1 text-xs text-muted-foreground">Open items will appear here as data changes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
