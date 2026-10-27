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
    HOT: 'bg-accent/10 text-accent',
    WARM: 'bg-warning/10 text-warning',
    COLD: 'bg-muted text-foreground',
    DEAD: 'bg-muted text-muted-foreground',
  };
  return (
    <Card className="p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-sm truncate max-w-[120px]">{name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${heatColors[heat]}`}>{score}/100</span>
      </div>
      <p className="text-xs text-muted-foreground truncate">{lead.requirement || lead.sub_category || 'No details'}</p>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-[9px] uppercase font-semibold text-muted-foreground">{lead.status ?? 'NEW'}</span>
        <Button size="sm" variant="ghost" className="h-6 text-xs text-primary">View</Button>
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

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'text-accent', bg: 'from-accent/10 to-destructive/10 border-accent/20' },
          { label: 'Warm Leads', value: stats.warm, icon: ThermometerSun, color: 'text-warning', bg: 'from-warning/10 to-warning/10 border-warning/20' },
          { label: 'Total Pipeline', value: stats.total, icon: Target, color: 'text-foreground', bg: 'bg-muted border-border' },
          { label: 'Conversion', value: `${stats.conversion}%`, icon: TrendingUp, color: 'text-primary', bg: 'from-primary/10 border-primary/20' },
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
            { heat: 'HOT' as HeatLevel, icon: Flame, label: 'Hot', color: 'text-accent', bg: 'bg-accent/10/50 border-accent/10' },
            { heat: 'WARM' as HeatLevel, icon: ThermometerSun, label: 'Warm', color: 'text-warning', bg: 'bg-warning/10/50 border-warning/10' },
            { heat: 'COLD' as HeatLevel, icon: Snowflake, label: 'Cold', color: 'text-foreground', bg: 'bg-muted/50 border-border' },
            { heat: 'DEAD' as HeatLevel, icon: Skull, label: 'Dead', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border opacity-70' },
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
