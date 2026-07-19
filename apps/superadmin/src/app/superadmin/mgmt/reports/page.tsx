"use client";

import { useEffect, useState } from 'react';
import { RecentActivityTable, type ActivityItem } from '@tecbunny/admin-ui';
import { createClient } from '@tecbunny/core';

type AuditActivity = {
  id: string;
  table_name?: string | null;
  action?: string | null;
  created_at?: string | null;
  user_id?: string | null;
};

function mapAuditActivity(item: AuditActivity): ActivityItem {
  const action = item.action || 'activity';
  const tableName = item.table_name || 'system';

  return {
    id: item.id,
    type: tableName,
    description: `${action.toUpperCase()} on ${tableName}`,
    date: item.created_at || new Date().toISOString(),
    status: action === 'delete' ? 'cancelled' : 'completed',
  };
}

export default function Page() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('audit_logs')
          .select('id,table_name,action,created_at,user_id')
          .order('created_at', { ascending: false })
          .limit(25);

        if (queryError) throw queryError;
        if (active) setActivities(((data ?? []) as AuditActivity[]).map(mapAuditActivity));
      } catch (loadError) {
        console.error('Failed to load report activity', loadError);
        if (active) setError('Unable to load recent activity.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivities();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Reports</h1>
        <p className="mt-1 text-sm text-zinc-400">Recent administrative activity across governed data surfaces.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-400">Loading recent activity...</div>
        ) : (
          <RecentActivityTable activities={activities} />
        )}
      </div>
    </div>
  );
}