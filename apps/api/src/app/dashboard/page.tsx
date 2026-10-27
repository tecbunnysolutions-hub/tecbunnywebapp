'use client';

import { useMemo, useRef, useState } from 'react';
import manifest from '../../generated/api-manifest.json';
import { classify, isLiveAction, keyOf, parseConfig, preparation, reportCsv, reportRows, requestPath, responseFailed, responseShape, type ApiRow, type CheckResult, type RequestConfig } from '../../lib/dashboard-checks';

const rows: ApiRow[] = manifest.routes.flatMap(route => route.methods.map(method => ({ ...route, method: method.method, access: method.access })));
const groups = [...new Set(rows.map(row => row.group))].sort();
const methods = [...new Set(rows.map(row => row.method))].sort();
const labels: Record<string, string> = { passed: 'Passed', failed: 'Failed', auth_required: 'Auth required', needs_input: 'Needs input', skipped: 'Skipped', cancelled: 'Cancelled', running: 'Checking', not_checked: 'Not checked' };
const colors: Record<string, string> = { passed: 'text-success', failed: 'text-destructive', auth_required: 'text-warning', needs_input: 'text-warning', skipped: 'text-muted-foreground', cancelled: 'text-muted-foreground', running: 'text-primary' };
const button = 'rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50';
const input = 'rounded-md border border-border px-2 py-2 text-sm';

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
  const [automaticAuth, setAutomaticAuth] = useState(true);
  const [authMessage, setAuthMessage] = useState('Demo authentication will be selected automatically when checks start');
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

  async function resolveCheckAuth(signal: AbortSignal) {
    if (!automaticAuth) return { bearer: token.trim(), context: authMessage };
    setSigningIn(true);
    try {
      const response = await fetch('/dashboard/demo-session', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Automatic demo sign-in failed');
      const context = data.configured ? 'Demo role: ' + data.role : 'Using current superadmin session (no demo account configured)';
      setAuthMessage(context);
      return { bearer: data.configured ? String(data.token) : '', context };
    } finally { setSigningIn(false); }
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
    let auth: { bearer: string; context: string };
    try {
      auth = await resolveCheckAuth(abort.signal);
    } catch (error) {
      const detail = abort.signal.aborted ? 'Run stopped before authentication.' : error instanceof Error ? error.message : 'Automatic authentication failed';
      setAuthMessage(detail);
      setResults(previous => ({ ...previous, ...Object.fromEntries(targets.map(row => [keyOf(row), { state: abort.signal.aborted ? 'cancelled' : 'auth_required', detail, checkedAt: new Date().toISOString() } as CheckResult])) }));
      setProgress({ completed: targets.length, total: targets.length });
      setRunInfo({ scope, startedAt, finishedAt: new Date().toISOString() });
      setRunning(false);
      active.current = false;
      controller.current = null;
      return;
    }
    const { bearer } = auth;
    let cursor = 0;
    const record = (row: ApiRow, result: CheckResult) => {
      const customAuth = Object.keys(configs[keyOf(row)]?.headers ?? {}).some(name => name.toLowerCase() === 'authorization');
      setResults(previous => ({ ...previous, [keyOf(row)]: { ...result, authContext: bearer ? `${auth.context} (cookies omitted)` : customAuth ? 'Request Authorization header (cookies omitted)' : 'Current session' } }));
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
    <div className="min-h-screen bg-muted text-foreground">
      <nav className="border-b bg-card"><div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <h1 className="text-xl font-semibold">TecBunny API Health Dashboard</h1>
        <button className={button} disabled={signingOut} onClick={signOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
      </div></nav>
      <main className="mx-auto max-w-screen-2xl space-y-5 px-6 py-6">
        {logoutError && <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{logoutError}</p>}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8" aria-label="Report summary">
          {[['Endpoints', rows.length], ['Passed', counts.passed ?? 0], ['Failed', counts.failed ?? 0], ['Auth required', counts.auth_required ?? 0], ['Needs input', counts.needs_input ?? 0], ['Skipped', counts.skipped ?? 0], ['Cancelled', counts.cancelled ?? 0], ['Not checked', rows.length - Object.keys(results).length]].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>
          ))}
        </section>
        <section className="space-y-4 rounded-lg border bg-card p-4">
          <div><h2 className="font-semibold">Run checks</h2><p className="mt-1 text-sm text-muted-foreground">Checks automatically sign in with the server-configured demo account, or reuse your current superadmin session when no demo account is configured. No password entry is needed.</p></div>
          <label className="block text-sm">Authentication<select className={input + ' ml-2'} value={automaticAuth ? 'automatic' : 'session'} disabled={running || signingIn} onChange={event => { setAutomaticAuth(event.target.value === 'automatic'); setToken(''); setAuthMessage(event.target.value === 'automatic' ? 'Demo authentication will be selected automatically when checks start' : 'Using current superadmin session'); setResults({}); setRunInfo(undefined); }}><option value="automatic">Automatic demo account</option><option value="session">Current session / custom token</option></select></label>
          <p className="text-sm" role="status">{authMessage}</p>
          {!automaticAuth && <label className="block text-sm">Bearer token (optional)<input type="password" autoComplete="off" value={token} onChange={event => { setToken(event.target.value); setAuthMessage(event.target.value.trim() ? 'Using supplied bearer token' : 'Using current superadmin session'); setResults({}); setRunInfo(undefined); }} disabled={running || signingIn} className={`${input} mt-1 block w-full max-w-2xl`} placeholder="Leave empty to use the current session" /></label>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeActions} disabled={running} onChange={event => setIncludeActions(event.target.checked)} />Include configured live actions (writes, jobs, payments and messages)</label>
          <p className="text-xs text-muted-foreground">Every endpoint gets a report entry. Dynamic routes need demo IDs. Live actions also require allowSideEffects: true in their request settings and perform real operations. A passing response checks this request only; it does not prove every business workflow.</p>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" disabled={running || signingIn} onClick={() => run(rows, 'All APIs')}>Check all {rows.length} APIs</button>
            <button className={button} disabled={running || !filtered.length} onClick={() => run([...filtered], 'Filtered APIs')}>Check {filtered.length} filtered</button>
            <button className={button} disabled={!running} onClick={() => controller.current?.abort()}>Stop</button>
            <button className={button} disabled={running} onClick={() => exportReport('csv')}>Download all results (CSV)</button>
            <button className={button} disabled={running} onClick={() => exportReport('json')}>Download all results (JSON)</button>
            <button className={button} disabled={running} onClick={() => { setResults({}); setRunInfo(undefined); setProgress({ completed: 0, total: 0 }); }}>Clear results</button>
          </div>
          {progress.total > 0 && <div className="space-y-1" role="status" aria-live="polite"><p className="text-sm">{running ? 'Checking' : 'Finished'}: {progress.completed} / {progress.total} endpoints · {runInfo?.scope}</p><progress className="w-full" value={progress.completed} max={progress.total} /></div>}
        </section>
        {editor && <section className="space-y-3 rounded-lg border border-primary/20 bg-card p-4" aria-label="Request settings">
          <h2 className="font-semibold">Configure {keyOf(editor)}</h2>
          <p className="text-sm text-muted-foreground">Set params to demo IDs, query to URL parameters, headers to required API keys or signatures, and body to JSON. Optionally set expectedStatus (for example, 403 for a permission test). Secrets are excluded from reports.</p>
          <label className="block text-sm">Request settings (JSON)<textarea className={`${input} mt-1 block w-full font-mono`} rows={13} spellCheck={false} value={editorText} onChange={event => setEditorText(event.target.value)} disabled={running} /></label>
          {editorError && <p role="alert" className="text-sm text-destructive">{editorError}</p>}
          <div className="flex gap-2"><button className={button} disabled={running} onClick={saveConfig}>Save request</button><button className={button} onClick={() => { setEditor(undefined); setEditorText(''); }}>Close</button></div>
        </section>}
        <section className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4" aria-label="Filter endpoints">
          <label className="text-sm">Search<input className={`${input} ml-2`} value={query} onChange={event => { setQuery(event.target.value); setLimit(100); }} placeholder="/api/products" /></label>
          {([['Method', method, setMethod, methods], ['Access', access, setAccess, ['public', 'protected']], ['Group', group, setGroup, groups], ['Result', status, setStatus, Object.keys(labels)]] as const).map(([label, value, setter, options]) => (
            <label key={label} className="text-sm">{label}<select className={`${input} ml-2`} value={value} onChange={event => { setter(event.target.value); setLimit(100); }}><option value="ALL">All</option>{options.map(option => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>
          ))}
        </section>
        <div className="overflow-x-auto rounded-lg border bg-card"><table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{['Method', 'Endpoint', 'Access', 'Result', 'Latency', 'Details', 'Actions'].map(title => <th key={title} className="px-4 py-3">{title}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">{filtered.slice(0, limit).map(row => {
            const result = results[keyOf(row)];
            return <tr key={keyOf(row)}>
              <td className="px-4 py-3 font-mono text-xs">{row.method}</td><td className="max-w-sm break-words px-4 py-3 font-mono text-xs">{row.path}</td>
              <td className="px-4 py-3 text-xs">{row.access === 'public' ? 'Public gateway' : 'Auth required'}</td>
              <td className={`whitespace-nowrap px-4 py-3 text-xs font-medium ${colors[result?.state ?? ''] ?? 'text-muted-foreground'}`}>{labels[result?.state ?? 'not_checked']}{result?.status !== undefined ? ` (${result.status})` : ''}</td>
              <td className="whitespace-nowrap px-4 py-3 text-xs">{result?.ms !== undefined ? `${result.ms} ms` : '—'}</td>
              <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">{result?.detail ?? (settings[keyOf(row)] ? 'Request configured' : row.dynamic ? 'Configure path parameters' : isLiveAction(row) ? 'Configure and enable this live action' : 'Ready to check')}</td>
              <td className="px-4 py-3"><div className="flex gap-3"><button className="text-xs font-medium text-primary disabled:opacity-50" disabled={running} onClick={() => run([row], keyOf(row))}>Check</button><button className="text-xs font-medium text-primary disabled:opacity-50" disabled={running} onClick={() => configure(row)}>Configure</button></div></td>
            </tr>;
          })}</tbody>
        </table>{!filtered.length && <p className="p-6 text-sm text-muted-foreground">No matching endpoints.</p>}</div>
        <div className="flex justify-between text-sm text-muted-foreground"><span>Showing {Math.min(limit, filtered.length)} of {filtered.length} endpoints</span>{limit < filtered.length && <button className="text-primary" onClick={() => setLimit(previous => previous + 100)}>Show more</button>}</div>
      </main>
    </div>
  );
}
