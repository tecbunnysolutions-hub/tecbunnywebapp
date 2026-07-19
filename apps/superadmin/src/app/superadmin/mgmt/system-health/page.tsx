'use client';

import * as React from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

type HealthCheck = {
  id: string;
  label: string;
  status: 'healthy' | 'configuration_required' | 'informational' | string;
  detail: string;
};

type HealthResponse = {
  status: string;
  service: string;
  checks: HealthCheck[];
  timestamp: string;
  version: string;
  environment: string;
};

const statusStyles: Record<string, string> = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  configuration_required: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  informational: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
};

function emitProductTelemetry(event: string, payload: Record<string, string | number | boolean | null | undefined>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tecbunny:product-telemetry', {
    detail: { event, payload, timestamp: new Date().toISOString() },
  }));
}

export default function SystemHealthPage() {
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const lastTelemetryKey = React.useRef<string | null>(null);

  const loadHealth = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Unable to load health status.');
      setHealth(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load health status.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const checks = health?.checks ?? [];
  const launchBlockers = checks.filter((check) => check.status === 'configuration_required');
  const riskAlerts = checks.filter((check) => check.status !== 'healthy' && check.status !== 'informational');
  const healthyChecks = checks.filter((check) => check.status === 'healthy');

  React.useEffect(() => {
    if (!health || launchBlockers.length === 0) return;
    const telemetryKey = `${health.timestamp}:${launchBlockers.map((check) => check.id).join(',')}`;
    if (lastTelemetryKey.current === telemetryKey) return;
    lastTelemetryKey.current = telemetryKey;
    emitProductTelemetry('launch_health_blocker_viewed', {
      blockerCount: launchBlockers.length,
      environment: health.environment,
      service: health.service,
    });
  }, [health, launchBlockers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <Activity className="h-7 w-7 text-blue-400" />
            System Health
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
            Review runtime readiness, provider contracts, and launch blockers before enabling enterprise traffic.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadHealth()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-900 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {health && (
        <section aria-label="Launch risk summary" className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Healthy checks</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{healthyChecks.length}</p>
            <p className="mt-1 text-sm text-zinc-500">Runtime/provider checks currently ready.</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/70">Launch blockers</p>
            <p className="mt-2 text-3xl font-black text-amber-100">{launchBlockers.length}</p>
            <p className="mt-1 text-sm text-amber-100/70">Configuration items required before enterprise traffic.</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-200/70">Risk alerts</p>
            <p className="mt-2 text-3xl font-black text-red-100">{riskAlerts.length}</p>
            <p className="mt-1 text-sm text-red-100/70">Non-healthy signals to review before launch approval.</p>
          </div>
        </section>
      )}

      {launchBlockers.length > 0 && (
        <section aria-label="Launch blockers" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-base font-bold text-white">Launch approval blocked</h2>
              <p className="mt-1 text-sm leading-6 text-amber-100/75">
                Resolve these configuration requirements before presenting this environment as enterprise-ready.
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-amber-50">
                {launchBlockers.map((check) => (
                  <li key={check.id} className="rounded-lg bg-black/20 px-3 py-2">
                    <span className="font-semibold">{check.label}:</span> {check.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {checks.map((check) => {
          const healthy = check.status === 'healthy';
          const Icon = healthy ? CheckCircle2 : AlertTriangle;
          return (
            <article key={check.id} className={`rounded-xl border p-5 ${statusStyles[check.status] ?? 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">{check.status.replaceAll('_', ' ')}</p>
                  <h2 className="mt-2 text-base font-bold text-white">{check.label}</h2>
                </div>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm leading-6 opacity-80">{check.detail}</p>
            </article>
          );
        })}

        {loading && !health && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-400">
            Loading health checks...
          </div>
        )}
      </section>

      {health && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
          Last checked {new Date(health.timestamp).toLocaleString()} · {health.service} · {health.environment} · v{health.version}
        </div>
      )}
    </div>
  );
}