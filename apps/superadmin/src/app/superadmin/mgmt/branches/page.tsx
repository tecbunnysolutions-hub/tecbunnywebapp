'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Save, Trash2, Loader2, MapPin } from 'lucide-react';
import { GlobalDrawer } from '@/components/superadmin/GlobalDrawer';

type Organization = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
  location: string | null;
  organization_id: string;
  created_at: string;
  organization: {
    name: string;
  };
};

type PageNotice = { tone: 'error' | 'success'; message: string };

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<PageNotice | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [location, setLocation] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, orgsRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/organizations'),
      ]);
      if (branchesRes.ok) setBranches(await branchesRes.json());
      if (orgsRes.ok) setOrganizations(await orgsRes.json());
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !orgId) return;
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          organization_id: orgId,
          location: location.trim() || null,
        }),
      });
      if (res.ok) {
        setName('');
        setOrgId('');
        setLocation('');
        setIsCreating(false);
        setNotice({ tone: 'success', message: 'Branch created successfully.' });
        fetchData();
      } else {
        const error = await res.json();
        setNotice({ tone: 'error', message: error.error || 'Failed to create branch.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error creating branch. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    setNotice(null);
    try {
      const res = await fetch('/api/branches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPendingDeleteId(null);
        setNotice({ tone: 'success', message: 'Branch deleted successfully.' });
        fetchData();
      } else {
        const error = await res.json();
        setNotice({ tone: 'error', message: error.error || 'Failed to delete branch.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error deleting branch. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-destructive shrink-0" />
            Branches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and assign regional business branch locations.
          </p>
        </div>
        <button
          onClick={() => {
            if (organizations.length === 0) {
              setNotice({ tone: 'error', message: 'Create at least one organization before adding branches.' });
              return;
            }
            // Set default org selection if available
            setOrgId(organizations[0].id);
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-destructive bg-destructive hover:bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Branch
        </button>
      </div>

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border px-4 py-3 text-sm ${notice.tone === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-success/30 bg-success/10 text-success'}`}
        >
          {notice.message}
        </div>
      )}

      {/* Global Drawer for configuration */}
      <GlobalDrawer
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Branch"
        width="450px"
      >
        <form onSubmit={handleCreateBranch} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Branch Name
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. San Francisco HQ"
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-destructive transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assign Organization
            </label>
            <select
              disabled={submitting}
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-destructive transition-colors"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-background">
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Location / Address
            </label>
            <input
              type="text"
              disabled={submitting}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. California, US"
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-destructive transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-destructive bg-destructive hover:bg-destructive disabled:opacity-50 text-destructive-foreground rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Branch
            </button>
          </div>
        </form>
      </GlobalDrawer>

      {/* Table Data list */}
      <div className="rounded-xl border border-border bg-card/50 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
            <p className="text-muted-foreground text-sm">Loading branches...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Branch Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Belongs To
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Location
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Created At
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-transparent">
                {branches.map((br) => (
                  <tr key={br.id} className="hover:bg-card/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-foreground text-sm">{br.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{br.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-card text-muted-foreground border border-border">
                        {br.organization.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {br.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {br.location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No address set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                      {new Date(br.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {pendingDeleteId === br.id ? (
                        <div className="inline-flex items-center justify-end gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1">
                          <span className="text-xs font-medium text-destructive">Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(br.id)}
                            className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground hover:bg-destructive"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-card hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(br.id)}
                          aria-label={`Delete branch ${br.name}`}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-all inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic text-sm">
                      No branches configured. Create one to get started.
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
