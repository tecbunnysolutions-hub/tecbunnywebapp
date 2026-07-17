'use client';

import * as React from 'react';
import { Flame, ThermometerSun, Snowflake, Skull, TrendingUp, Target, PhoneCall, RefreshCw } from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '@tecbunny/ui';
import { createClient } from '@tecbunny/database';

type HeatLevel = 'HOT' | 'WARM' | 'COLD' | 'DEAD';

interface Lead {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  requirement?: string;
  heat_level?: HeatLevel;
  lead_score?: number;
  status?: string;
  sub_category?: string;
}

function classifyHeat(score: number): HeatLevel {
  if (score >= 80) return 'HOT';
  if (score >= 50) return 'WARM';
  if (score >= 20) return 'COLD';
  return 'DEAD';
}

function LeadCardSkeleton() {
  return (
    <Card className="p-3">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-3" />
      <Skeleton className="h-3 w-1/2" />
    </Card>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.phone || 'Unknown';
  const score = lead.lead_score ?? 0;
  const heat = lead.heat_level ?? classifyHeat(score);
  const heatColors: Record<HeatLevel, string> = {
    HOT: 'bg-orange-100 text-orange-700',
    WARM: 'bg-amber-100 text-amber-700',
    COLD: 'bg-slate-200 text-slate-700',
    DEAD: 'bg-zinc-200 text-zinc-500',
  };
  return (
    <Card className="p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-sm truncate max-w-[120px]">{name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${heatColors[heat]}`}>{score}/100</span>
      </div>
      <p className="text-xs text-muted-foreground truncate">{lead.requirement || lead.sub_category || 'No details'}</p>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-[9px] uppercase font-semibold text-slate-500">{lead.status ?? 'NEW'}</span>
        <Button size="sm" variant="ghost" className="h-6 text-xs text-indigo-600">View</Button>
      </div>
    </Card>
  );
}

export default function LeadCenter() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('sls_leads')
        .select('id, first_name, last_name, phone, requirement, heat_level, lead_score, status, sub_category')
        .order('lead_score', { ascending: false })
        .limit(100);
      if (dbError) throw dbError;
      const rows: Lead[] = (data || []).map((r: any) => ({
        ...r,
        heat_level: r.heat_level ?? classifyHeat(r.lead_score ?? 0),
      }));
      setLeads(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const byHeat = React.useMemo(() => ({
    HOT:  leads.filter(l => l.heat_level === 'HOT'),
    WARM: leads.filter(l => l.heat_level === 'WARM'),
    COLD: leads.filter(l => l.heat_level === 'COLD'),
    DEAD: leads.filter(l => l.heat_level === 'DEAD'),
  }), [leads]);

  const stats = React.useMemo(() => ({
    hot: byHeat.HOT.length,
    warm: byHeat.WARM.length,
    total: leads.length,
    conversion: leads.length > 0
      ? Math.round((leads.filter(l => l.status === 'CONVERTED').length / leads.length) * 1000) / 10
      : 0,
  }), [leads, byHeat]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Engine: Lead Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI-Qualified leads prioritized by heat level.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm"><PhoneCall className="w-4 h-4 mr-2" /> Start Dialing</Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'text-orange-700', bg: 'from-orange-50 to-red-50 border-orange-200' },
          { label: 'Warm Leads', value: stats.warm, icon: ThermometerSun, color: 'text-amber-700', bg: 'from-amber-50 to-yellow-50 border-amber-200' },
          { label: 'Total Pipeline', value: stats.total, icon: Target, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Conversion', value: `${stats.conversion}%`, icon: TrendingUp, color: 'text-blue-700', bg: 'from-blue-50 border-blue-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={`p-4 bg-gradient-to-br ${bg}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-current/70">{label}</p>
                {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>}
              </div>
              <Icon className="w-5 h-5 opacity-60" />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Lead Heat Map</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[400px]">
          {([
            { heat: 'HOT' as HeatLevel, icon: Flame, label: 'Hot', color: 'text-orange-700', bg: 'bg-orange-50/50 border-orange-100' },
            { heat: 'WARM' as HeatLevel, icon: ThermometerSun, label: 'Warm', color: 'text-amber-700', bg: 'bg-amber-50/50 border-amber-100' },
            { heat: 'COLD' as HeatLevel, icon: Snowflake, label: 'Cold', color: 'text-slate-700', bg: 'bg-slate-50/50 border-slate-100' },
            { heat: 'DEAD' as HeatLevel, icon: Skull, label: 'Dead', color: 'text-zinc-500', bg: 'bg-zinc-50/50 border-zinc-100 opacity-70' },
          ]).map(({ heat, icon: Icon, label, color, bg }) => (
            <div key={heat} className={`rounded-lg p-3 border flex flex-col gap-3 ${bg}`}>
              <h3 className={`text-xs font-bold flex items-center gap-2 uppercase tracking-wider mb-2 ${color}`}>
                <Icon className="w-4 h-4" /> {label} ({byHeat[heat].length})
              </h3>
              {loading ? [1, 2].map(i => <LeadCardSkeleton key={i} />) : byHeat[heat].map(l => <LeadCard key={l.id} lead={l} />)}
              {!loading && byHeat[heat].length === 0 && (
                <p className="text-xs text-center py-6 text-muted-foreground">No {label.toLowerCase()} leads</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
