'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@tecbunny/core';
import { AuditLog } from '@tecbunny/core/types';

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  insert: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  upsert: 'bg-indigo-100 text-indigo-800',
  delete: 'bg-red-100 text-red-800',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchTable, setSearchTable] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);

  const buildQuery = useCallback(
    (supabase: ReturnType<typeof createClient>, cursor?: string | null) => {
      let q = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE + 1);

      if (searchTable) q = q.ilike('table_name', `%${searchTable}%`);
      if (filterAction !== 'all') q = q.eq('action', filterAction);
      if (cursor) q = q.lt('created_at', cursor);
      return q;
    },
    [searchTable, filterAction],
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const supabase = createClient();
      const { data, error } = await buildQuery(supabase);
      if (error) throw error;
      const page = (data ?? []) as AuditLog[];
      setHasMore(page.length > PAGE_SIZE);
      const trimmed = page.slice(0, PAGE_SIZE);
      setLogs(trimmed);
      cursorRef.current = trimmed.at(-1)?.created_at ?? null;
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const supabase = createClient();
      const { data, error } = await buildQuery(supabase, cursorRef.current);
      if (error) throw error;
      const page = (data ?? []) as AuditLog[];
      setHasMore(page.length > PAGE_SIZE);
      const trimmed = page.slice(0, PAGE_SIZE);
      setLogs((prev) => [...prev, ...trimmed]);
      cursorRef.current = trimmed.at(-1)?.created_at ?? null;
    } catch (err) {
      console.error('Failed to load more audit logs', err);
    } finally {
      setLoadingMore(false);
    }
  }, [buildQuery, loadingMore]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            System-wide write operations tracked by the security middleware.
            {logs.length > 0 && <span className="ml-2 font-medium text-gray-700">Showing {logs.length} records</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          placeholder="Filter by table name…"
          className="border rounded-md px-3 py-2 w-full sm:w-64 text-sm"
          value={searchTable}
          onChange={(e) => setSearchTable(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 w-full sm:w-auto text-sm"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="insert">Insert</option>
          <option value="update">Update</option>
          <option value="upsert">Upsert</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User / System</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Record ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payload diff</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">Loading audit logs…</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No logs match your criteria.</td>
              </tr>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    title={isExpanded ? 'Collapse' : 'Expand payload'}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('en-IN', { hour12: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-700 max-w-[160px] truncate" title={log.user_id ?? undefined}>
                      {log.user_id ?? <span className="italic text-gray-400">system</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-[11px] leading-5 font-semibold rounded-full ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-medium">
                      {log.table_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 max-w-[120px] truncate" title={(log as any).record_id ?? undefined}>
                      {(log as any).record_id ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                      {isExpanded ? (
                        <pre className="whitespace-pre-wrap break-all text-[10px] bg-gray-50 p-2 rounded border max-h-40 overflow-y-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      ) : (
                        <span className="truncate block max-w-[240px] font-mono" title={JSON.stringify(log.payload)}>
                          {log.payload ? JSON.stringify(log.payload) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
