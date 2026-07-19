'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Cpu,
  CreditCard,
  Database,
  Gauge,
  GitBranch,
  LineChart,
  LockKeyhole,
  Package,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  WalletCards,
  Wrench,
  Zap,
} from 'lucide-react';

import type {
  DashboardActivity,
  DashboardInsight,
  DashboardIssue,
  DashboardMetric,
  DashboardSeriesPoint,
  DashboardSeverity,
  SuperadminCommandCenterData,
} from '@/lib/superadmin-dashboard-data';

const severityStyles: Record<DashboardSeverity, string> = {
  critical: 'border-red-500/40 bg-red-500/10 text-red-200',
  high: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  low: 'border-sky-500/35 bg-sky-500/10 text-sky-100',
  ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
};

const metricIcons = [Building2, GitBranch, Users, Activity, ShoppingCart, WalletCards, Package, Wrench, Bot, Server, Database, Gauge];

function getMetricIcon(index: number) {
  return metricIcons[index % metricIcons.length];
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', hour12: false });
}

function MetricCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const Icon = getMetricIcon(index);
  return (
    <Link
      href={metric.href ?? '#'}
      className="group min-h-32 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 shadow-lg shadow-black/10 transition hover:border-red-500/40 hover:bg-zinc-900"
      aria-label={`${metric.label}: ${metric.displayValue}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-widest text-zinc-500">{metric.label}</p>
          <p className="mt-2 break-words text-2xl font-black tracking-tight text-white">{metric.displayValue}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-red-400">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span className="truncate">{metric.source}</span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 uppercase ${severityStyles[metric.severity]}`}>{metric.severity}</span>
      </div>
    </Link>
  );
}

function Section({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">{eyebrow}</p> : null}
          <h2 className="text-base font-black text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SeriesBars({ points }: { points: DashboardSeriesPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <div className="grid h-36 grid-cols-7 items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      {points.map((point) => (
        <div key={point.label} className="flex h-full min-w-0 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end rounded bg-zinc-950/70 p-1">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-red-700 to-amber-300"
              style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }}
              title={`${point.label}: ${point.value}`}
            />
          </div>
          <p className="truncate text-center text-[10px] font-semibold text-zinc-500">{point.label}</p>
        </div>
      ))}
    </div>
  );
}

function RankingList({ points, empty }: { points: DashboardSeriesPoint[]; empty: string }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  if (points.length === 0) return <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">{empty}</p>;
  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      {points.map((point) => (
        <div key={point.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold text-zinc-200">{point.label}</span>
            <span className="font-mono text-zinc-500">{Math.round(point.value).toLocaleString('en-IN')}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.max(5, (point.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityList({ items, empty }: { items: DashboardActivity[]; empty: string }) {
  if (items.length === 0) return <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">{empty}</p>;
  return (
    <div className="divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
      {items.map((item) => (
        <Link key={`${item.source}-${item.id}`} href={item.href ?? '#'} className="block p-3 transition hover:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{item.label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{item.detail}</p>
            </div>
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{timeLabel(item.timestamp)} / {item.source}</p>
        </Link>
      ))}
    </div>
  );
}

function NotificationList({ issues, onRefresh }: { issues: DashboardIssue[]; onRefresh: () => void }) {
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  const acknowledge = async (issue: DashboardIssue, status: 'acknowledged' | 'resolved' = 'acknowledged') => {
    if (!issue.alertKey || pendingKey) return;
    setPendingKey(issue.alertKey);
    try {
      await fetch('/api/superadmin/dashboard/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertKey: issue.alertKey, module: issue.module, severity: issue.severity, status }),
      });
      onRefresh();
    } finally {
      setPendingKey(null);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
        No active command-center alerts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.slice(0, 6).map((issue) => (
        <article key={`${issue.module}-${issue.rootCause}`} className={`rounded-lg border p-4 ${severityStyles[issue.severity]} ${issue.acknowledged ? 'opacity-60' : ''}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white">{issue.module}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-300">{issue.businessImpact}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{issue.recommendedSolution}</p>
              {issue.acknowledged ? (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Acknowledged{issue.acknowledgedBy ? ` by ${issue.acknowledgedBy}` : ''}
                </p>
              ) : null}
            </div>
            {issue.alertKey && !issue.acknowledged ? (
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => void acknowledge(issue)}
                  disabled={pendingKey === issue.alertKey}
                  className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300 disabled:opacity-50"
                >
                  {pendingKey === issue.alertKey ? 'Saving…' : 'Acknowledge'}
                </button>
                <button
                  type="button"
                  onClick={() => void acknowledge(issue, 'resolved')}
                  disabled={pendingKey === issue.alertKey}
                  className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-sky-500/60 hover:text-sky-300 disabled:opacity-50"
                >
                  Resolve
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function InsightList({ insights }: { insights: DashboardInsight[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {insights.map((insight) => (
        <article key={insight.title} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-white">{insight.title}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityStyles[insight.severity]}`}>{insight.severity}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{insight.detail}</p>
              <p className="mt-3 text-xs font-semibold text-red-300">{insight.action}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AiQueryPanel() {
  const [question, setQuestion] = React.useState('What needs executive attention right now?');
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function askDashboard() {
    const trimmed = question.trim();
    if (trimmed.length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/dashboard/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok) throw new Error(`Dashboard AI returned ${response.status}`);
      const payload = await response.json() as { answer: string; provider: string };
      setAnswer(payload.answer);
      setProvider(payload.provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to answer dashboard question');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-start gap-3">
        <Bot className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-black text-white">Natural Language Dashboard Query</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Answers are grounded in the current command-center payload and fall back safely if Gemini is unavailable.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-11 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/50"
              placeholder="Ask about revenue, risks, operations, alerts, or growth"
            />
            <button
              type="button"
              onClick={() => void askDashboard()}
              disabled={loading || question.trim().length < 3}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 text-sm font-bold text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Ask
            </button>
          </div>
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
          {answer ? (
            <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{provider ?? 'dashboard'} answer</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{answer}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    ['Create Company', '/superadmin/mgmt/organizations', Building2],
    ['Create Branch', '/superadmin/mgmt/branches', GitBranch],
    ['Create User', '/superadmin/mgmt/users', Users],
    ['Create Role', '/superadmin/mgmt/roles', LockKeyhole],
    ['Create Product', '/superadmin/mgmt/products', Package],
    ['Create Category', '/superadmin/mgmt/products', BriefcaseBusiness],
    ['Create Campaign', '/superadmin/mgmt/marketing', Zap],
    ['Send Broadcast', '/superadmin/mgmt/marketing', Bell],
    ['View Reports', '/superadmin/mgmt/reports', BarChart3],
    ['Open Analytics', '/superadmin/mgmt/reports', LineChart],
    ['Manage Settings', '/superadmin/mgmt/settings', Wrench],
    ['System Health', '/superadmin/mgmt/system-health', ShieldCheck],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {actions.map(([label, href, Icon]) => (
        <Link key={label} href={href} className="flex min-h-16 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs font-bold text-zinc-200 transition hover:border-red-500/40 hover:bg-zinc-900">
          <Icon className="h-4 w-4 shrink-0 text-red-400" />
          <span className="min-w-0 leading-4">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function SuperadminCommandCenter({ initialData }: { initialData: SuperadminCommandCenterData }) {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/dashboard/command-center', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Dashboard API returned ${response.status}`);
      setData(await response.json() as SuperadminCommandCenterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh dashboard');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-lg border border-zinc-800 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.22),_transparent_32%),linear-gradient(135deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">Executive Command Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Superadmin Dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
              Live operating view across companies, users, revenue, orders, inventory, support, WABA, audit, staff activity, security, analytics, and platform health.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Production Readiness</p>
              <p className="mt-1 text-2xl font-black text-white">{data.readinessPercent}%</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Health</p>
              <p className="mt-1 text-2xl font-black text-white">{data.healthScore}%</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span>Auto refresh: 30s</span>
          <span>Last generated: {timeLabel(data.generatedAt)}</span>
          {error ? <span className="text-red-300">{error}</span> : null}
        </div>
      </header>

      <Section title="Executive Overview" eyebrow="Part 1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          {data.executiveMetrics.map((item, index) => <MetricCard key={item.key} metric={item} index={index} />)}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Section title="Business KPIs" eyebrow="Part 2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.businessMetrics.map((item, index) => <MetricCard key={item.key} metric={item} index={index + 3} />)}
          </div>
        </Section>
        <Section title="Notification Center" eyebrow="Part 9">
          <NotificationList issues={data.notifications} onRefresh={() => void refresh()} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Revenue Analytics" eyebrow="Part 5">
          <SeriesBars points={data.revenueTrend} />
        </Section>
        <Section title="Order Analytics" eyebrow="Part 5">
          <SeriesBars points={data.orderTrend} />
        </Section>
      </div>

      <Section title="Real-Time Operations" eyebrow="Part 3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {data.realtimeMetrics.map((item, index) => <MetricCard key={item.key} metric={item} index={index + 8} />)}
        </div>
      </Section>

      <Section title="System Health" eyebrow="Part 4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.systemMetrics.map((item, index) => <MetricCard key={item.key} metric={item} index={index + 1} />)}
        </div>
      </Section>

      <Section title="Analytics Coverage" eyebrow="Part 5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.analyticsMetrics.map((item, index) => <MetricCard key={item.key} metric={item} index={index + 5} />)}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <Section title="Top Products" eyebrow="Business">
          <RankingList points={data.topProducts} empty="No product sales data available." />
        </Section>
        <Section title="Low Stock Products" eyebrow="Inventory">
          <RankingList points={data.lowStockProducts} empty="No low-stock products detected." />
        </Section>
        <Section title="Top Companies" eyebrow="ERP">
          <RankingList points={data.topCompanies} empty="No company revenue data available." />
        </Section>
        <Section title="Top Branches" eyebrow="ERP">
          <RankingList points={data.topBranches} empty="No branch activity data available." />
        </Section>
      </div>

      <Section title="AI Insights" eyebrow="Part 10">
        <InsightList insights={data.aiInsights} />
      </Section>

      <Section title="Ask Command Center" eyebrow="AI Query">
        <AiQueryPanel />
      </Section>

      <Section title="Quick Actions" eyebrow="Part 11">
        <QuickActions />
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Section title="Recent Activity" eyebrow="Part 6">
          <ActivityList items={data.recentActivity} empty="No recent activity found." />
        </Section>
        <Section
          title="Staff Activity"
          eyebrow="Part 7"
          action={<a href="/api/superadmin/dashboard/export?type=staff&days=30" className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-500/60 hover:text-red-200">Export CSV</a>}
        >
          <ActivityList items={data.staffActivity} empty="No staff activity found." />
        </Section>
        <Section
          title="Audit Logs"
          eyebrow="Part 8"
          action={<a href="/api/superadmin/dashboard/export?type=audit&days=30" className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-500/60 hover:text-red-200">Export CSV</a>}
        >
          <ActivityList items={data.auditLogs} empty="No enterprise audit logs found." />
        </Section>
      </div>

      <Section
        title="Production Readiness Report"
        eyebrow="Final Report"
        action={
          <Link href="/superadmin/mgmt/audit-logs" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-300 hover:text-red-200">
            Open audit logs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {data.productionReport.slice(0, 8).map((issue) => (
            <article key={`${issue.module}-${issue.severity}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityStyles[issue.severity]}`}>{issue.severity}</span>
                <h3 className="text-sm font-black text-white">{issue.module}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{issue.businessImpact}</p>
              <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Implementation</p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                  {issue.implementationSteps.slice(0, 3).map((step) => <li key={step}>{step}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <Search className="h-4 w-4 text-red-400" />
          Permission And API Validation
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          This dashboard is session-gated by the Superadmin layout, the refresh path is protected by the Superadmin API guard, and each widget reports its source table or telemetry stream. Company and branch isolation remain enforced in downstream modules; the Superadmin command center intentionally aggregates ecosystem-wide data.
        </p>
      </div>
    </div>
  );
}