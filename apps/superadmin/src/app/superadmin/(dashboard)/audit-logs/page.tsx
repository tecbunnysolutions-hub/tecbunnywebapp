'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@tecbunny/core';
import { AuditLog } from '@tecbunny/core/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTable, setSearchTable] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const supabase = createClient();
        let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
        
        if (searchTable) {
          query = query.ilike('table_name', `%${searchTable}%`);
        }
        if (filterAction !== 'all') {
          query = query.eq('action', filterAction);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setLogs(data as AuditLog[]);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
  }, [searchTable, filterAction]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            View system-wide write operations tracked by the global security middleware.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input 
          type="text" 
          placeholder="Search by table name..."
          className="border rounded-md px-3 py-2 w-full sm:w-64"
          value={searchTable}
          onChange={(e) => setSearchTable(e.target.value)}
        />
        <select 
          className="border rounded-md px-3 py-2 w-full sm:w-auto"
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

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / System</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload (Diff)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading audit logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No logs found matching your criteria.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.action === 'insert' ? 'bg-green-100 text-green-800' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.table_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs max-w-xs truncate" title={JSON.stringify(log.payload)}>
                    {log.payload ? JSON.stringify(log.payload) : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
