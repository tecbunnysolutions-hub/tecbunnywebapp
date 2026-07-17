'use client';
import { createClient } from '@tecbunny/database';



import * as React from 'react';
import { AlertTriangle, CalendarDays, MapPin, RefreshCw, Wrench, ChevronDown, Plus } from 'lucide-react';

import { Button } from "@tecbunny/ui";
import type { ServiceTicket } from "@tecbunny/core/types";

const TICKET_STATUSES = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

interface ServiceTicketWorkspaceProps {
  mode: 'manager' | 'engineer';
}

export function ServiceTicketWorkspace({ mode }: ServiceTicketWorkspaceProps) {
  const supabase = React.useMemo(() => createClient(), []);
  const [tickets, setTickets] = React.useState<ServiceTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadTickets = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('service_tickets')
      .select('*')
      .order('scheduled_date', { ascending: true, nullsFirst: false })
      .limit(50);

    if (queryError) {
      setError(queryError.message);
      setTickets([]);
    } else {
      setTickets((data as ServiceTicket[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    setTimeout(() => { void loadTickets(); }, 0);
  }, [loadTickets]);

  const updateStatus = React.useCallback(async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    const { error: updateError } = await supabase
      .from('service_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (!updateError) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus as any } : t));
    }
    setUpdatingId(null);
  }, [supabase]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            {mode === 'manager' ? 'Regional dispatch board' : 'Personal field queue'}
          </p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {mode === 'manager' ? 'Service tickets' : 'Assigned jobs'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            {mode === 'manager'
              ? 'Tickets are restricted to your assigned service area.'
              : 'Only tickets assigned to your engineer account are visible.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadTickets} disabled={loading} variant="outline" className="w-full border-zinc-700 bg-zinc-900 sm:w-auto">
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          {mode === 'manager' && (
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> New Ticket
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">The service queue could not be loaded.</p>
            <p className="mt-1 text-amber-100/70">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
          ))
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-5 py-12 text-center">
            <Wrench className="mx-auto h-7 w-7 text-zinc-600" />
            <p className="mt-3 text-sm font-semibold text-zinc-300">No active tickets in this workspace.</p>
            <p className="mt-1 text-xs text-zinc-600">New assignments will appear here automatically.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {ticket.priority}
                    </span>
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                      {ticket.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <h2 className="mt-3 truncate text-base font-bold text-white">{ticket.customer_name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">{ticket.issue_description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-zinc-600">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                  {/* Inline status updater */}
                  <div className="relative">
                    <select
                      className="appearance-none text-[10px] font-bold uppercase tracking-wider rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 px-3 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={ticket.status}
                      disabled={updatingId === ticket.id}
                      onChange={e => updateStatus(ticket.id, e.target.value)}
                    >
                      {TICKET_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-4 text-xs text-zinc-500 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />
                  {ticket.scheduled_date ? new Date(ticket.scheduled_date).toLocaleString() : 'Schedule pending'}
                </span>
                <span className="flex items-center gap-2 sm:justify-end">
                  <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                  <span className="truncate">{ticket.customer_address || 'Address pending'}</span>
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
