'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Save, Trash2, Loader2 } from 'lucide-react';
import { GlobalDrawer } from '@/components/superadmin/GlobalDrawer';

type Organization = {
  id: string;
  name: string;
  created_at: string;
  _count: {
    branches: number;
    users: number;
  };
};

type PageNotice = { tone: 'error' | 'success'; message: string };

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<PageNotice | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        setOrganizations(await res.json());
      }
    } catch (e) {
      console.error('Error fetching organizations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName }),
      });
      if (res.ok) {
        setNewOrgName('');
        setIsCreating(false);
        setNotice({ tone: 'success', message: 'Organization created successfully.' });
        fetchOrgs();
      } else {
        const error = await res.json();
        setNotice({ tone: 'error', message: error.error || 'Failed to create organization.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error creating organization. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async (id: string) => {
    setNotice(null);
    try {
      const res = await fetch('/api/organizations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPendingDeleteId(null);
        setNotice({ tone: 'success', message: 'Organization deleted successfully.' });
        fetchOrgs();
      } else {
        const error = await res.json();
        setNotice({ tone: 'error', message: error.error || 'Failed to delete organization.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error deleting organization. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <Building2 className="h-8 w-8 text-red-500 shrink-0" />
            Organizations
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create, manage, and configure multi-tenant business organizations.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Organization
        </button>
      </div>

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border px-4 py-3 text-sm ${notice.tone === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
        >
          {notice.message}
        </div>
      )}

      {/* Global Drawer for configuration */}
      <GlobalDrawer
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Organization"
        width="450px"
      >
        <form onSubmit={handleCreateOrg} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Organization Name
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Organization
            </button>
          </div>
        </form>
      </GlobalDrawer>

      {/* Table Data list */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-zinc-500 text-sm">Loading organizations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Organization Info
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Branches
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Users
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Created At
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-transparent">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-white text-sm">{org.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{org.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {org._count.branches} Branches
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {org._count.users} Users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-medium">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {pendingDeleteId === org.id ? (
                        <div className="inline-flex items-center justify-end gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1">
                          <span className="text-xs font-medium text-red-200">Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrg(org.id)}
                            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(org.id)}
                          aria-label={`Delete organization ${org.name}`}
                          className="p-1.5 text-zinc-500 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-all inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {organizations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic text-sm">
                      No organizations configured. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
