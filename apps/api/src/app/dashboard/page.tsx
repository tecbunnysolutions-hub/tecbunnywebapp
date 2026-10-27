'use client';

import { useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import manifest from '../../generated/api-manifest.json';
import { classify, isLiveAction, keyOf, parseConfig, preparation, reportCsv, reportRows, requestPath, responseFailed, responseShape, type ApiRow, type CheckResult, type RequestConfig } from '../../lib/dashboard-checks';

const rows: ApiRow[] = manifest.routes.flatMap(route => route.methods.map(method => ({ ...route, method: method.method, access: method.access })));
const groups = [...new Set(rows.map(row => row.group))].sort();
const methods = [...new Set(rows.map(row => row.method))].sort();
const labels: Record<string, string> = { passed: 'Passed', failed: 'Failed', auth_required: 'Auth required', needs_input: 'Needs input', skipped: 'Skipped', cancelled: 'Cancelled', running: 'Checking', not_checked: 'Not checked' };
const colors: Record<string, string> = { passed: 'text-green-700', failed: 'text-red-700', auth_required: 'text-amber-700', needs_input: 'text-amber-700', skipped: 'text-gray-500', cancelled: 'text-gray-500', running: 'text-blue-700' };
const button = 'rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50';
const input = 'rounded-md border border-gray-300 px-2 py-2 text-sm';

function download(contents: string, extension: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `api-health-report-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DashboardPage() {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [settings, setSettings] = useState<Record<string, RequestConfig>>({});
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('ALL');
  const [access, setAccess] = useState('ALL');
  const [group, setGroup] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [limit, setLimit] = useState(100);
  const [token, setToken] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('Using current superadmin session');
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [includeActions, setIncludeActions] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [runInfo, setRunInfo] = useState<{ scope: string; startedAt: string; finishedAt?: string }>();
  const [editor, setEditor] = useState<ApiRow>();
  const [editorText, setEditorText] = useState('');
  const [editorError, setEditorError] = useState('');
  const active = useRef(false);
  const leaving = useRef(false);
  const controller = useRef<AbortController | null>(null);

  async function signOut() {
    leaving.current = true;
    controller.current?.abort();
    setSigningOut(true);
    setLogoutError('');
    setToken('');
    setAuthMessage('Signing out');
    setDemoPassword('');
    setSettings({});
    setResults({});
    try {
      const response = await fetch('/api/admin-auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Sign-out failed. Please try again.');
      window.location.replace('/login');
    } catch {
      leaving.current = false;
      setAuthMessage('Sign-out incomplete; the current session may still be active');
      setLogoutError('Could not complete sign-out. Check your connection and try again.');
      setSigningOut(false);
    }
  }

  async function signInDemo() {
    setSigningIn(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error('Public authentication configuration is missing.');
      const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
      const { data, error } = await client.auth.signInWithPassword({ email: demoEmail.trim(), password: demoPassword });
      if (leaving.current) return;
      if (error || !data.session) throw new Error(error?.message || 'Sign in failed');
      setToken(data.session.access_token);
      setAuthMessage(`Demo role: ${String(data.user.app_metadata.role ?? 'customer')}`);
      setResults({});
      setRunInfo(undefined);
    } catch (error) { if (!leaving.current) { setToken(''); setResults({}); setAuthMessage(error instanceof Error ? error.message : 'Sign in failed'); } }
    finally { setSigningIn(false); setDemoPassword(''); }
  }

  const filtered = useMemo(() => rows.filter(row =>
    (method === 'ALL' || row.method === method) && (access === 'ALL' || row.access === access) &&
    (group === 'ALL' || row.group === group) && (status === 'ALL' || (results[keyOf(row)]?.state ?? 'not_checked') === status) &&
    (!query.trim() || row.path.toLowerCase().includes(query.trim().toLowerCase()))), [method, access, group, status, results, query]);
  const counts = useMemo(() => Object.values(results).reduce<Record<string, number>>((sum, result) => {
    sum[result.state] = (sum[result.state] ?? 0) + 1; return sum;
  }, {}), [results]);

  async function run(targets: ApiRow[], scope: string) {
    if (active.current || signingIn || signingOut || leaving.current) return;
    active.current = true;
    setRunning(true);
    const abort = new AbortController();
    controller.current = abort;
    const startedAt = new Date().toISOString();
    setRunInfo({ scope, startedAt });
    setProgress({ completed: 0, total: targets.length });
    const pending = new Set(targets.map(keyOf));
    setResults(previous => scope === 'All APIs' ? {} : Object.fromEntries(Object.entries(previous).filter(([key]) => !pending.has(key))));
    const configs = { ...settings };
    const bearer = token.trim();
    let cursor = 0;
    const record = (row: ApiRow, result: CheckResult) => {
      const customAuth = Object.keys(configs[keyOf(row)]?.headers ?? {}).some(name => name.toLowerCase() === 'authorization');
      setResults(previous => ({ ...previous, [keyOf(row)]: { ...result, authContext: bearer ? `${authMessage} (cookies omitted)` : customAuth ? 'Request Authorization header (cookies omitted)' : 'Current session' } }));
      setProgress(previous => ({ ...previous, completed: previous.completed + 1 }));
    };
    async function check(row: ApiRow) {
      const checkedAt = new Date().toISOString();
      if (abort.signal.aborted) { record(row, { state: 'cancelled', detail: 'Run stopped before request.', checkedAt }); return; }
      const config = configs[keyOf(row)] ?? {};
      const reason = preparation(row, config, includeActions);
      if (reason) { record(row, { state: isLiveAction(row) && (!includeActions || !config.allowSideEffects) ? 'skipped' : 'needs_input', detail: reason, checkedAt }); return; }
      setResults(previous => ({ ...previous, [keyOf(row)]: { state: 'running', detail: 'Request in progress', checkedAt } }));
      const start = performance.now();
      const timeout = new AbortController();
      const cancel = () => timeout.abort();
      abort.signal.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(() => timeout.abort(), 20000);
      try {
        const headers = new Headers(config.headers);
        headers.set('Cache-Control', 'no-cache');
        if (bearer) headers.set('Authorization', `Bearer ${bearer}`);
        if (config.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        const response = await fetch(requestPath(row, config), {
          method: row.method, headers, body: config.body === undefined ? undefined : JSON.stringify(config.body),
          credentials: headers.has('Authorization') ? 'omit' : 'same-origin', redirect: 'manual', cache: 'no-store', signal: timeout.signal,
        });
        const text = await response.text();
        let state = classify(response.status, config.expectedStatus);
        if (state === 'passed' && config.expectedStatus === undefined && responseFailed(text)) state = 'failed';
        const detail = response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)
          ? 'Redirect returned; target was not followed.'
          : `${responseShape(text)}${responseFailed(text) ? '. Response reports a failure or unhealthy state.' : ''}${state === 'auth_required' ? '. Session, role, API key or signature required.' : ''}${state === 'needs_input' ? '. Configure the required query or request body.' : ''}${response.status === 429 ? '. Rate limited; retry later.' : ''}${config.expectedStatus !== undefined ? `. Expected HTTP ${config.expectedStatus}.` : ''}`;
        record(row, { state, status: response.status, ms: Math.round(performance.now() - start), detail, checkedAt });
      } catch {
        record(row, { state: abort.signal.aborted ? 'cancelled' : 'failed', ms: Math.round(performance.now() - start), detail: abort.signal.aborted ? 'Stopped by user; a submitted live action may still finish on the server.' : timeout.signal.aborted ? 'Timed out after 20 seconds; server work may still finish.' : 'Network error or browser rejected the request settings.', checkedAt });
      } finally {
        clearTimeout(timer);
        abort.signal.removeEventListener('abort', cancel);
      }
    }
    try {
      await Promise.all(Array.from({ length: 2 }, async () => { while (cursor < targets.length) await check(targets[cursor++]); }));
    } finally {
      setRunInfo({ scope, startedAt, finishedAt: new Date().toISOString() });
      setRunning(false);
      active.current = false;
      controller.current = null;
    }
  }

  function configure(row: ApiRow) {
    setEditor(row);
    setEditorError('');
    const params = Object.fromEntries([...row.path.matchAll(/\[(?:\[)?(?:\.\.\.)?([^\]]+)\]/g)].map(match => [match[1], '']));
    setEditorText(JSON.stringify(settings[keyOf(row)] ?? { params, query: {}, headers: {}, ...(!['GET', 'HEAD', 'OPTIONS'].includes(row.method) ? { body: {} } : {}), ...(isLiveAction(row) ? { allowSideEffects: false } : {}) }, null, 2));
  }
  function saveConfig() {
    if (!editor) return;
    try {
      const config = parseConfig(editorText);
      setSettings(previous => ({ ...previous, [keyOf(editor)]: config }));
      setResults(previous => { const next = { ...previous }; delete next[keyOf(editor)]; return next; });
      setEditor(undefined);
      setEditorText('');
    } catch (error) { setEditorError(error instanceof Error ? error.message : 'Invalid request settings'); }
  }
  function exportReport(format: 'csv' | 'json') {
    const endpoints = reportRows(rows, results);
    if (format === 'csv') download(reportCsv(endpoints), 'csv', 'text/csv;charset=utf-8');
    else download(JSON.stringify({ generatedAt: new Date().toISOString(), run: runInfo, summary: { total: rows.length, notChecked: rows.length - Object.keys(results).length, ...counts }, endpoints }, null, 2), 'json', 'application/json');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="border-b bg-white"><div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <h1 className="text-xl font-semibold">TecBunny API Health Dashboard</h1>
        <button className={button} disabled={signingOut} onClick={signOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
      </div></nav>
      <main className="mx-auto max-w-screen-2xl space-y-5 px-6 py-6">
        {logoutError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{logoutError}</p>}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8" aria-label="Report summary">
          {[['Endpoints', rows.length], ['Passed', counts.passed ?? 0], ['Failed', counts.failed ?? 0], ['Auth required', counts.auth_required ?? 0], ['Needs input', counts.needs_input ?? 0], ['Skipped', counts.skipped ?? 0], ['Cancelled', counts.cancelled ?? 0], ['Not checked', rows.length - Object.keys(results).length]].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>
          ))}
        </section>
        <section className="space-y-4 rounded-lg border bg-white p-4">
          <div><h2 className="font-semibold">Run checks</h2><p className="mt-1 text-sm text-gray-600">Use the current superadmin session, or paste a demo user access token to test that user&apos;s permissions. Credentials and request settings stay in this tab&apos;s memory.</p></div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">Demo email<input type="email" autoComplete="off" value={demoEmail} onChange={event => setDemoEmail(event.target.value)} disabled={running || signingIn} className={`${input} mt-1 block`} /></label>
            <label className="text-sm">Demo password<input type="password" autoComplete="off" value={demoPassword} onChange={event => setDemoPassword(event.target.value)} disabled={running || signingIn} className={`${input} mt-1 block`} /></label>
            <button className={button} disabled={running || signingIn || !demoEmail || !demoPassword} onClick={signInDemo}>{signingIn ? 'Signing in…' : 'Use demo account'}</button>
            <button className={button} disabled={running || signingIn} onClick={() => { setToken(''); setAuthMessage('Using current superadmin session'); setResults({}); setRunInfo(undefined); }}>Use superadmin session</button>
          </div>
          <p className="text-sm" role="status">{authMessage}</p>
          <label className="block text-sm">Bearer token (optional)<input type="password" autoComplete="off" value={token} onChange={event => { setToken(event.target.value); setAuthMessage(event.target.value.trim() ? 'Using supplied bearer token' : 'Using current superadmin session'); setResults({}); setRunInfo(undefined); }} disabled={running || signingIn} className={`${input} mt-1 block w-full max-w-2xl`} placeholder="Leave empty to use the current session" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeActions} disabled={running} onChange={event => setIncludeActions(event.target.checked)} />Include configured live actions (writes, jobs, payments and messages)</label>
          <p className="text-xs text-gray-500">Every endpoint gets a report entry. Dynamic routes need demo IDs. Live actions also require allowSideEffects: true in their request settings and perform real operations. A passing response checks this request only; it does not prove every business workflow.</p>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={running || signingIn} onClick={() => run(rows, 'All APIs')}>Check all {rows.length} APIs</button>
            <button className={button} disabled={running || !filtered.length} onClick={() => run([...filtered], 'Filtered APIs')}>Check {filtered.length} filtered</button>
            <button className={button} disabled={!running} onClick={() => controller.current?.abort()}>Stop</button>
            <button className={button} disabled={running} onClick={() => exportReport('csv')}>Download all results (CSV)</button>
            <button className={button} disabled={running} onClick={() => exportReport('json')}>Download all results (JSON)</button>
            <button className={button} disabled={running} onClick={() => { setResults({}); setRunInfo(undefined); setProgress({ completed: 0, total: 0 }); }}>Clear results</button>
          </div>
          {progress.total > 0 && <div className="space-y-1" role="status" aria-live="polite"><p className="text-sm">{running ? 'Checking' : 'Finished'}: {progress.completed} / {progress.total} endpoints · {runInfo?.scope}</p><progress className="w-full" value={progress.completed} max={progress.total} /></div>}
        </section>
        {editor && <section className="space-y-3 rounded-lg border border-blue-200 bg-white p-4" aria-label="Request settings">
          <h2 className="font-semibold">Configure {keyOf(editor)}</h2>
          <p className="text-sm text-gray-600">Set params to demo IDs, query to URL parameters, headers to required API keys or signatures, and body to JSON. Optionally set expectedStatus (for example, 403 for a permission test). Secrets are excluded from reports.</p>
          <label className="block text-sm">Request settings (JSON)<textarea className={`${input} mt-1 block w-full font-mono`} rows={13} spellCheck={false} value={editorText} onChange={event => setEditorText(event.target.value)} disabled={running} /></label>
          {editorError && <p role="alert" className="text-sm text-red-700">{editorError}</p>}
          <div className="flex gap-2"><button className={button} disabled={running} onClick={saveConfig}>Save request</button><button className={button} onClick={() => { setEditor(undefined); setEditorText(''); }}>Close</button></div>
        </section>}
        <section className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4" aria-label="Filter endpoints">
          <label className="text-sm">Search<input className={`${input} ml-2`} value={query} onChange={event => { setQuery(event.target.value); setLimit(100); }} placeholder="/api/products" /></label>
          {([['Method', method, setMethod, methods], ['Access', access, setAccess, ['public', 'protected']], ['Group', group, setGroup, groups], ['Result', status, setStatus, Object.keys(labels)]] as const).map(([label, value, setter, options]) => (
            <label key={label} className="text-sm">{label}<select className={`${input} ml-2`} value={value} onChange={event => { setter(event.target.value); setLimit(100); }}><option value="ALL">All</option>{options.map(option => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>
          ))}
        </section>
        <div className="overflow-x-auto rounded-lg border bg-white"><table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600"><tr>{['Method', 'Endpoint', 'Access', 'Result', 'Latency', 'Details', 'Actions'].map(title => <th key={title} className="px-4 py-3">{title}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">{filtered.slice(0, limit).map(row => {
            const result = results[keyOf(row)];
            return <tr key={keyOf(row)}>
              <td className="px-4 py-3 font-mono text-xs">{row.method}</td><td className="max-w-sm break-words px-4 py-3 font-mono text-xs">{row.path}</td>
              <td className="px-4 py-3 text-xs">{row.access === 'public' ? 'Public gateway' : 'Auth required'}</td>
              <td className={`whitespace-nowrap px-4 py-3 text-xs font-medium ${colors[result?.state ?? ''] ?? 'text-gray-500'}`}>{labels[result?.state ?? 'not_checked']}{result?.status !== undefined ? ` (${result.status})` : ''}</td>
              <td className="whitespace-nowrap px-4 py-3 text-xs">{result?.ms !== undefined ? `${result.ms} ms` : '—'}</td>
              <td className="max-w-xs px-4 py-3 text-xs text-gray-600">{result?.detail ?? (settings[keyOf(row)] ? 'Request configured' : row.dynamic ? 'Configure path parameters' : isLiveAction(row) ? 'Configure and enable this live action' : 'Ready to check')}</td>
              <td className="px-4 py-3"><div className="flex gap-3"><button className="text-xs font-medium text-blue-700 disabled:opacity-50" disabled={running} onClick={() => run([row], keyOf(row))}>Check</button><button className="text-xs font-medium text-blue-700 disabled:opacity-50" disabled={running} onClick={() => configure(row)}>Configure</button></div></td>
            </tr>;
          })}</tbody>
        </table>{!filtered.length && <p className="p-6 text-sm text-gray-500">No matching endpoints.</p>}</div>
        <div className="flex justify-between text-sm text-gray-600"><span>Showing {Math.min(limit, filtered.length)} of {filtered.length} endpoints</span>{limit < filtered.length && <button className="text-blue-700" onClick={() => setLimit(previous => previous + 100)}>Show more</button>}</div>
      </main>
    </div>
  );
}
