'use client';

import * as React from 'react';
import { createClient } from '@tecbunny/database';
import { Card, Button, Badge, Input, Skeleton } from '@tecbunny/ui';
import { CheckSquare, Plus, RefreshCw, Search, Clock, AlertCircle, CheckCircle2, User } from 'lucide-react';

interface Task {
  id: string;
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  type?: 'TASK' | 'APPROVAL';
  created_at?: string;
}

const PRIORITY_BADGE: Record<string, string> = {
  LOW:    'bg-zinc-100 text-zinc-500',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH:   'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const STATUS_BADGE: Record<string, string> = {
  OPEN:               'bg-slate-100 text-slate-600',
  IN_PROGRESS:        'bg-blue-100 text-blue-700',
  AWAITING_APPROVAL:  'bg-amber-100 text-amber-700',
  APPROVED:           'bg-emerald-100 text-emerald-700',
  REJECTED:           'bg-red-100 text-red-600',
  DONE:               'bg-green-100 text-green-700',
};

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'ALL' | 'TASK' | 'APPROVAL'>('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = (supabase as any)
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter !== 'ALL') query = query.eq('type', typeFilter);
      if (statusFilter !== 'ALL') query = query.eq('status', statusFilter);
      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      setTasks(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search]);

  React.useEffect(() => { loadTasks(); }, [loadTasks]);

  const pending = tasks.filter(t => t.status === 'AWAITING_APPROVAL').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" /> Tasks &amp; Approvals
          </h1>
          <p className="text-sm text-muted-foreground">Internal tasks, service approvals, and pending actions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTasks} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Task</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'text-indigo-600' },
          { label: 'Pending Approval', value: pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Done', value: tasks.filter(t => t.status === 'DONE').length, icon: CheckCircle2, color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
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

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search tasks…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
        >
          <option value="ALL">All Types</option>
          <option value="TASK">Tasks</option>
          <option value="APPROVAL">Approvals</option>
        </select>
        <select
          className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {['OPEN', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'DONE'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          : tasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';
              return (
                <Card key={task.id} className={`p-4 ${isOverdue ? 'border-red-200' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-slate-800 truncate">{task.title || 'Untitled'}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority || 'LOW'] || 'bg-slate-100 text-slate-600'}`}>
                          {task.priority || 'LOW'}
                        </span>
                        {task.type === 'APPROVAL' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">APPROVAL</span>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{task.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                        {task.assigned_to && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigned_to}</span>
                        )}
                        {task.due_date && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('en-IN')}
                            {isOverdue && ' (overdue)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status || 'OPEN'] || 'bg-slate-100 text-slate-600'}`}>
                      {(task.status || 'OPEN').replace(/_/g, ' ')}
                    </span>
                  </div>
                </Card>
              );
            })
        }
        {!loading && tasks.length === 0 && (
          <div className="py-16 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
