'use client';

import * as React from 'react';
import { createClient } from '@tecbunny/database';
import { Card, Button, Badge, Input, Skeleton } from '@tecbunny/ui';
import {
  FileText, RefreshCw, Plus, Search, Calendar, Phone, CheckCircle, AlertTriangle, Clock,
} from 'lucide-react';

interface AmcContract {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  contract_number?: string;
  contract_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  annual_value?: number;
  site_address?: string;
  service_items?: string[];
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700',
  EXPIRING:  'bg-amber-100 text-amber-700',
  EXPIRED:   'bg-red-100 text-red-600',
  DRAFT:     'bg-zinc-100 text-zinc-500',
  CANCELLED: 'bg-zinc-200 text-zinc-500',
};

function daysUntil(date?: string) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function resolveStatus(contract: AmcContract): string {
  if (contract.status && contract.status !== 'ACTIVE') return contract.status;
  const days = daysUntil(contract.end_date);
  if (days === null) return contract.status || 'DRAFT';
  if (days < 0) return 'EXPIRED';
  if (days <= 30) return 'EXPIRING';
  return 'ACTIVE';
}

export default function AmcPage() {
  const [contracts, setContracts] = React.useState<AmcContract[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('ALL');

  const fetch = React.useCallback(async (q = '', f = 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = (supabase as any)
        .from('amc_contracts')
        .select('*')
        .order('end_date', { ascending: true });

      if (f !== 'ALL') query = query.eq('status', f);
      if (q.trim()) query = query.or(`customer_name.ilike.%${q.trim()}%,contract_number.ilike.%${q.trim()}%`);

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      setContracts(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetch(search, filter); }, [fetch, search, filter]);

  const statusCounts = React.useMemo(() => {
    const m: Record<string, number> = { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0 };
    contracts.forEach(c => {
      const s = resolveStatus(c);
      m[s] = (m[s] || 0) + 1;
    });
    return m;
  }, [contracts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> AMC Contracts
          </h1>
          <p className="text-sm text-muted-foreground">Annual Maintenance Contract lifecycle management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetch(search, filter)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Contract</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: statusCounts.ACTIVE, color: 'text-emerald-600', icon: CheckCircle },
          { label: 'Expiring (30d)', value: statusCounts.EXPIRING, color: 'text-amber-600', icon: Clock },
          { label: 'Expired', value: statusCounts.EXPIRED, color: 'text-red-600', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                {loading ? <Skeleton className="h-7 w-8 mt-1" /> : <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>}
              </div>
              <Icon className={`w-5 h-5 opacity-50 ${color}`} />
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search customer or contract number…"
            className="pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); }}
          />
        </div>
        <select
          className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {['ALL', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'DRAFT', 'CANCELLED'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Contract #', 'Customer', 'Type', 'End Date', 'Value', 'Status'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : contracts.map(c => {
                    const status = resolveStatus(c);
                    const statusCls = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600';
                    const days = daysUntil(c.end_date);
                    return (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs">{c.contract_number || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{c.customer_name || '—'}</div>
                          {c.customer_phone && (
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />{c.customer_phone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{c.contract_type || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs">{c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN') : '—'}</div>
                          {days !== null && days >= 0 && days <= 60 && (
                            <div className="text-[10px] text-amber-600 font-semibold">{days}d remaining</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {c.annual_value ? `₹${c.annual_value.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
        {!loading && contracts.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No contracts found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
