'use client';

import * as React from 'react';
import { createClient } from '@tecbunny/database';
import { Card, Button, Skeleton } from '@tecbunny/ui';
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw, MapPin, Clock, User } from 'lucide-react';

interface CalEvent {
  id: string;
  title?: string;
  event_type?: string;
  start_at?: string;
  end_at?: string;
  assigned_to?: string;
  location?: string;
  status?: string;
  linked_ticket_id?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_COLORS: Record<string, string> = {
  SERVICE:      'bg-blue-100 text-blue-700 border-blue-200',
  INSTALLATION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  MEETING:      'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERY:     'bg-amber-100 text-amber-700 border-amber-200',
  DEFAULT:      'bg-slate-100 text-slate-700 border-slate-200',
};

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const [events, setEvents] = React.useState<CalEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Date | null>(null);

  const loadEvents = React.useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const from = new Date(y, m, 1).toISOString();
      const to   = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
      const supabase = createClient();
      const { data } = await (supabase as any)
        .from('calendar_events')
        .select('*')
        .gte('start_at', from)
        .lte('start_at', to)
        .order('start_at', { ascending: true });
      setEvents(data || []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { loadEvents(year, month); }, [loadEvents, year, month]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const eventsByDate = React.useMemo(() => {
    const m: Record<string, CalEvent[]> = {};
    for (const e of events) {
      if (!e.start_at) continue;
      const key = e.start_at.substring(0, 10);
      if (!m[key]) m[key] = [];
      m[key].push(e);
    }
    return m;
  }, [events]);

  const selectedKey = selected?.toISOString().substring(0, 10);
  const selectedEvents = selectedKey ? (eventsByDate[selectedKey] || []) : [];
  const matrix = getMonthMatrix(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" /> Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Service schedules, installations, and team events.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadEvents(year, month)} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar Grid */}
        <Card className="p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="font-semibold text-base">{monthName}</h2>
            <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-xs font-semibold text-slate-500">{d}</div>
            ))}
            {matrix.map((week, wi) =>
              week.map((date, di) => {
                const key = date?.toISOString().substring(0, 10);
                const dayEvents = key ? (eventsByDate[key] || []) : [];
                const isToday = date?.toDateString() === now.toDateString();
                const isSelected = date?.toDateString() === selected?.toDateString();
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`relative min-h-[72px] border border-slate-100 p-1.5 cursor-pointer transition-colors ${
                      !date ? 'bg-slate-50' :
                      isSelected ? 'bg-indigo-50 border-indigo-200' :
                      'hover:bg-slate-50'
                    }`}
                    onClick={() => date && setSelected(date)}
                  >
                    {date && (
                      <>
                        <span className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full ${
                          isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                        }`}>
                          {date.getDate()}
                        </span>
                        {loading ? null : dayEvents.slice(0, 2).map(e => (
                          <div
                            key={e.id}
                            className={`mt-0.5 truncate text-[9px] font-medium px-1 py-px rounded border ${
                              EVENT_COLORS[e.event_type || 'DEFAULT'] || EVENT_COLORS.DEFAULT
                            }`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-slate-400 mt-0.5">+{dayEvents.length - 2} more</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Day Detail Panel */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-slate-800 mb-4">
            {selected
              ? selected.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Select a day'}
          </h3>
          {!selected && (
            <p className="text-xs text-slate-400">Click any date on the calendar to see its events.</p>
          )}
          {selected && selectedEvents.length === 0 && (
            <p className="text-xs text-slate-400">No events scheduled for this day.</p>
          )}
          <div className="space-y-3">
            {selectedEvents.map(e => (
              <div key={e.id} className={`rounded-lg border p-3 text-xs ${EVENT_COLORS[e.event_type || 'DEFAULT'] || EVENT_COLORS.DEFAULT}`}>
                <div className="font-semibold mb-1">{e.title || 'Untitled event'}</div>
                {e.start_at && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(e.start_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {e.end_at && <> — {new Date(e.end_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</>}
                  </div>
                )}
                {e.location && (
                  <div className="flex items-center gap-1 text-[11px] mt-0.5">
                    <MapPin className="w-3 h-3" />{e.location}
                  </div>
                )}
                {e.assigned_to && (
                  <div className="flex items-center gap-1 text-[11px] mt-0.5">
                    <User className="w-3 h-3" />{e.assigned_to}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
