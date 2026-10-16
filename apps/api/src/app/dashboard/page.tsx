'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import manifest from '../../generated/api-manifest.json';

type Access = 'public' | 'protected';
type Row = { path: string; group: string; dynamic: boolean; method: string; access: Access };
type Probe = { state: 'idle' | 'running' | 'ok' | 'degraded' | 'down'; status?: number; ms?: number; preview?: string };

const rows: Row[] = manifest.routes.flatMap((route) =>
  route.methods.map((m) => ({ path: route.path, group: route.group, dynamic: route.dynamic, method: m.method, access: m.access as Access })),
);

// Probing runs real handlers, so only anonymous, parameterless reads are allowed, minus anything with side effects.
const UNSAFE = /\/(cron|webhooks?|logout|callback|deployment|indexnow|release-notes|monitoring|upload|payment)(\/|$)/;
const canProbe = (row: Row) => row.method === 'GET' && row.access === 'public' && !row.dynamic && !UNSAFE.test(row.path);
const keyOf = (row: Row) => `${row.method} ${row.path}`;

const METHOD_STYLE: Record<string, string> = {
  GET: 'bg-green-50 text-green-700 ring-green-600/20',
  POST: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  PUT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  PATCH: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  DELETE: 'bg-red-50 text-red-700 ring-red-600/20',
};

function preview(text: string): string {
  const trimmed = text.trim();
  try {
    const json = JSON.parse(trimmed) as unknown;
    const data = json && typeof json === 'object' && 'data' in json ? (json as { data: unknown }).data : json;
    if (Array.isArray(data)) return `array(${data.length})`;
    if (data && typeof data === 'object') return `{ ${Object.keys(data).slice(0, 6).join(', ')} }`;
    return String(data).slice(0, 120);
  } catch {
    return trimmed.slice(0, 120);
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [probes, setProbes] = useState<Record<string, Probe>>({});
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('ALL');
  const [access, setAccess] = useState<'ALL' | Access>('ALL');
  const [group, setGroup] = useState('ALL');
  const [limit, setLimit] = useState(100);

  const groups = useMemo(() => Array.from(new Set(rows.map((r) => r.group))).sort(), []);
  const methods = useMemo(() => Array.from(new Set(rows.map((r) => r.method))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (method === 'ALL' || r.method === method) &&
        (access === 'ALL' || r.access === access) &&
        (group === 'ALL' || r.group === group) &&
        (!q || r.path.toLowerCase().includes(q)),
    );
  }, [query, method, access, group]);

  const probe = useCallback(async (row: Row) => {
    const key = keyOf(row);
    setProbes((prev) => ({ ...prev, [key]: { state: 'running' } }));
    const start = performance.now();
    try {
      const res = await fetch(row.path, { headers: { 'Cache-Control': 'no-cache' } });
      const ms = Math.round(performance.now() - start);
      const text = await res.text();
      const state: Probe['state'] = res.ok ? 'ok' : res.status >= 500 ? 'down' : 'degraded';
      setProbes((prev) => ({ ...prev, [key]: { state, status: res.status, ms, preview: preview(text) } }));
    } catch {
      setProbes((prev) => ({ ...prev, [key]: { state: 'down', ms: Math.round(performance.now() - start), preview: 'Unreachable' } }));
    }
  }, []);

  const probeMany = useCallback(
    async (targets: Row[]) => {
      const queue = targets.filter(canProbe);
      const workers = Array.from({ length: 4 }, async () => {
        for (let row = queue.shift(); row; row = queue.shift()) await probe(row);
      });
      await Promise.all(workers);
    },
    [probe],
  );

  const stats = useMemo(() => {
    const values = Object.values(probes);
    return {
      endpoints: rows.length,
      routes: manifest.routeCount,
      public: rows.filter((r) => r.access === 'public').length,
      probeable: rows.filter(canProbe).length,
      ok: values.filter((p) => p.state === 'ok').length,
      degraded: values.filter((p) => p.state === 'degraded').length,
      down: values.filter((p) => p.state === 'down').length,
    };
  }, [probes]);

  const byMethod = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.method] = (counts[r.method] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin-auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const visible = filtered.slice(0, limit);
  const probeableVisible = filtered.filter(canProbe);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">API</div>
            <span className="text-xl font-bold">TecBunny API Dashboard</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
            Sign out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {[
            ['Routes', stats.routes],
            ['Endpoints', stats.endpoints],
            ['Public', stats.public],
            ['Checkable', stats.probeable],
            ['Operational', stats.ok],
            ['Degraded', stats.degraded],
            ['Down', stats.down],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
              <div className="text-xs font-medium uppercase text-gray-500">{label}</div>
              <div className="mt-1 text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-gray-600">By method:</span>
          {byMethod.map(([m, count]) => (
            <span key={m} className={`rounded-md px-2 py-1 font-medium ring-1 ring-inset ${METHOD_STYLE[m] ?? 'bg-gray-50 text-gray-700 ring-gray-500/20'}`}>
              {m} {count}
            </span>
          ))}
        </section>

        <section className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
          <label className="text-sm">
            <span className="block text-xs text-gray-500">Search</span>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(100); }} placeholder="/api/products" className="w-56 rounded-md border border-gray-300 px-2 py-1.5" />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-500">Method</span>
            <select value={method} onChange={(e) => { setMethod(e.target.value); setLimit(100); }} className="rounded-md border border-gray-300 px-2 py-1.5">
              <option>ALL</option>
              {methods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-500">Access</span>
            <select value={access} onChange={(e) => { setAccess(e.target.value as 'ALL' | Access); setLimit(100); }} className="rounded-md border border-gray-300 px-2 py-1.5">
              <option>ALL</option>
              <option value="public">public</option>
              <option value="protected">protected</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-500">Group</span>
            <select value={group} onChange={(e) => { setGroup(e.target.value); setLimit(100); }} className="rounded-md border border-gray-300 px-2 py-1.5">
              <option>ALL</option>
              {groups.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => probeMany([...probeableVisible])}
            disabled={probeableVisible.length === 0}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
          >
            Check {probeableVisible.length} listed
          </button>
          <button
            type="button"
            onClick={() => setProbes({})}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear results
          </button>
        </section>

        <p className="text-xs text-gray-500">
          Checks call the live handlers, so only anonymous GET endpoints without path parameters can be checked (webhooks, cron, uploads and payment routes are excluded).
          Protected and write endpoints are listed from the route manifest only. Nothing runs automatically.
        </p>

        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((row) => {
                const p = probes[keyOf(row)];
                return (
                  <tr key={keyOf(row)}>
                    <td className="px-4 py-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${METHOD_STYLE[row.method] ?? 'bg-gray-50 text-gray-700 ring-gray-500/20'}`}>{row.method}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{row.path}</td>
                    <td className="px-4 py-2 text-xs">{row.access === 'public' ? 'Public' : 'Auth required'}</td>
                    <td className="px-4 py-2 text-xs">
                      {!p || p.state === 'idle' ? <span className="text-gray-400">{canProbe(row) ? 'Not checked' : 'Not checkable'}</span> : null}
                      {p?.state === 'running' ? <span className="text-gray-500">Checking…</span> : null}
                      {p?.state === 'ok' ? <span className="font-medium text-green-700">● Operational ({p.status})</span> : null}
                      {p?.state === 'degraded' ? <span className="font-medium text-yellow-700">● Degraded ({p.status})</span> : null}
                      {p?.state === 'down' ? <span className="font-medium text-red-700">● Down{p.status ? ` (${p.status})` : ''}</span> : null}
                    </td>
                    <td className={`px-4 py-2 text-xs ${p?.ms && p.ms > 500 ? 'font-medium text-yellow-700' : 'text-gray-500'}`}>{p?.ms !== undefined ? `${p.ms} ms` : '-'}</td>
                    <td className="max-w-xs truncate px-4 py-2 font-mono text-xs text-gray-600" title={p?.preview}>{p?.preview ?? '-'}</td>
                    <td className="px-4 py-2 text-right">
                      {canProbe(row) ? (
                        <button type="button" onClick={() => probe(row)} disabled={p?.state === 'running'} className="text-xs font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50">
                          Check
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {visible.length} of {filtered.length}</span>
          {filtered.length > limit ? (
            <button type="button" onClick={() => setLimit((n) => n + 100)} className="font-medium text-blue-600 hover:text-blue-500">
              Show more
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
