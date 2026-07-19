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
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  slate: 'bg-slate-50 text-slate-600',
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
  order: 'bg-blue-100 text-blue-600',
  lead: 'bg-indigo-100 text-indigo-600',
  ticket: 'bg-rose-100 text-rose-600',
};

const PRIORITY_CLASSES: Record<DashboardTask['priority'], string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  normal: 'border-slate-200 bg-slate-50 text-slate-700',
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
  <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{metric.title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${TONE_CLASSES[metric.tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="mt-4 text-sm text-slate-500">{metric.detail}</p>
  </div>
  );
};

function MetricSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="h-8 w-20 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-11 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
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
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500">Live operational summary for your assigned workspace.</p>
          {dashboard?.generatedAt ? (
            <p className="mt-1 text-xs text-slate-400">Updated {formatRelativeTime(dashboard.generatedAt)}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => loadDashboard()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
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

      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/15 rounded-lg"><Activity className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-semibold">Operational Focus</h3>
            <p className="text-blue-100 mt-1">
              {dashboard?.tasks.length
                ? `${dashboard.tasks[0].label}. Use the action queue below to jump directly into the responsible module.`
                : 'No urgent action queue is currently active for this workspace.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 py-3 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-32 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboard?.activities.length ? (
            <div className="space-y-4">
              {dashboard.activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ACTIVITY_COLORS[activity.type]}`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.detail} · {formatRelativeTime(activity.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              <Activity className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              No recent order, lead, or service activity was found.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Action Queue</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-12 rounded-lg bg-slate-100" />
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
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
              <p className="text-sm font-medium text-slate-800">No urgent tasks</p>
              <p className="mt-1 text-xs text-slate-500">Open items will appear here as data changes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
