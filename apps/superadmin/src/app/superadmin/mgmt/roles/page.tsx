"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Save, Trash2, CheckSquare, Square, AlertTriangle, Eye } from 'lucide-react';
import { GlobalDrawer } from '../../../../components/superadmin/GlobalDrawer';

type Permission = {
  id: string;
  module: string;
  action: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  organization_id?: string | null;
  permissions: { permission: Permission }[];
};

type PageNotice = { tone: 'error' | 'success'; message: string };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<PageNotice | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [simulatedAction, setSimulatedAction] = useState('read');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions')
      ]);
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (permsRes.ok) setPermissions(await permsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePermission = (id: string) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setNotice({ tone: 'error', message: 'Role name is required.' });
      return;
    }
    setNotice(null);

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: Array.from(selectedPerms)
        })
      });

      if (res.ok) {
        setNewRoleName('');
        setNewRoleDesc('');
        setSelectedPerms(new Set());
        setIsCreating(false);
        setNotice({ tone: 'success', message: 'Role created successfully.' });
        fetchData();
      } else {
        const error = await res.json();
        setNotice({ tone: 'error', message: error.error || 'Failed to create role.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error creating role. Please try again.' });
    }
  };

  const handleDeleteRole = async (id: string) => {
    setNotice(null);
    try {
      const res = await fetch('/api/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          organization_id: roles.find(r => r.id === id)?.organization_id ?? null,
        })
      });
      if (res.ok) {
        setPendingDeleteId(null);
        setNotice({ tone: 'success', message: 'Role deleted successfully.' });
        fetchData();
      } else {
        setNotice({ tone: 'error', message: 'Failed to delete role.' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ tone: 'error', message: 'Error deleting role. Please try again.' });
    }
  };

  // Group permissions by module
  const modules = Array.from(new Set(permissions.map(p => p.module)));
  const selectedPermissionDetails = permissions.filter(permission => selectedPerms.has(permission.id));
  const selectedModules = Array.from(new Set(selectedPermissionDetails.map(permission => permission.module)));
  const highRiskPermissions = selectedPermissionDetails.filter(permission => /delete|manage|admin|approve|write/i.test(permission.action));
  const simulatedMatches = selectedPermissionDetails.filter(permission => permission.action.toLowerCase().includes(simulatedAction.toLowerCase()));
  const simulatorDecision = simulatedMatches.length > 0
    ? highRiskPermissions.some(permission => simulatedMatches.some(match => match.id === permission.id))
      ? 'review'
      : 'allow'
    : 'deny';

  if (loading) return <div>Loading permissions matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Dynamic Role Builder
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage granular permissions for organizational roles.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary"
          >
            <Plus className="w-4 h-4" /> Create Custom Role
          </button>
        )}
      </div>

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border px-4 py-3 text-sm ${notice.tone === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-success/30 bg-success/10 text-success'}`}
        >
          {notice.message}
        </div>
      )}

      <GlobalDrawer
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="New Role Configuration"
        width="600px"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Role Name</label>
              <input
                value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                placeholder="e.g. Warehouse Manager"
                className="mt-1 block w-full rounded-md border-border shadow-sm p-2 border focus:border-primary focus:ring-primary text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Description</label>
              <input
                value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)}
                className="mt-1 block w-full rounded-md border-border shadow-sm p-2 border focus:border-primary focus:ring-primary text-foreground"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-muted-foreground mb-4">Permission Matrix</h3>
            <div className="grid grid-cols-1 gap-4">
              {modules.map(mod => (
                <div key={mod} className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-muted-foreground capitalize mb-3 pb-2 border-b border-border">{mod}</h4>
                  <div className="flex flex-wrap gap-4">
                    {permissions.filter(p => p.module === mod).map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary p-2 rounded">
                        {selectedPerms.has(p.id) ?
                          <CheckSquare className="w-5 h-5 text-primary" /> :
                          <Square className="w-5 h-5 text-muted-foreground" />
                        }
                        <input type="checkbox" className="hidden" checked={selectedPerms.has(p.id)} onChange={() => togglePermission(p.id)} />
                        <span className="text-sm text-muted-foreground capitalize">{p.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/20 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Eye className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">Policy impact preview</h3>
                <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <div className="rounded-md bg-overlay/20 p-3">
                    <dt className="text-muted-foreground">Selected permissions</dt>
                    <dd className="mt-1 font-bold text-foreground">{selectedPermissionDetails.length}</dd>
                  </div>
                  <div className="rounded-md bg-overlay/20 p-3">
                    <dt className="text-muted-foreground">Modules affected</dt>
                    <dd className="mt-1 font-bold text-foreground">{selectedModules.length}</dd>
                  </div>
                  <div className="rounded-md bg-overlay/20 p-3">
                    <dt className="text-muted-foreground">Elevated actions</dt>
                    <dd className={`mt-1 font-bold ${highRiskPermissions.length > 0 ? 'text-warning' : 'text-success'}`}>{highRiskPermissions.length}</dd>
                  </div>
                </dl>
                <div className="mt-3 rounded-md border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      {highRiskPermissions.length > 0
                        ? 'Review elevated actions before saving. These permissions may change data, approvals, or administrative controls.'
                        : 'No elevated permission pattern detected. Continue reviewing module coverage before saving.'}
                    </p>
                  </div>
                </div>
                {selectedModules.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedModules.map(module => (
                      <span key={module} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                        {module}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4" aria-label="RBAC simulator">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
                <Shield className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">RBAC simulator</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Test whether this draft role would allow a common action before saving it.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
                  <select
                    value={simulatedAction}
                    onChange={(event) => setSimulatedAction(event.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    aria-label="Simulated permission action"
                  >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="approve">Approve</option>
                    <option value="delete">Delete</option>
                    <option value="manage">Manage</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className={`rounded-md border px-3 py-2 text-sm ${simulatorDecision === 'allow' ? 'border-success/30 bg-success/10 text-success' : simulatorDecision === 'review' ? 'border-warning/30 bg-warning/10 text-warning' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                    <span className="font-semibold uppercase tracking-wide">{simulatorDecision}</span>
                    <span className="ml-2 text-xs opacity-80">
                      {simulatorDecision === 'allow'
                        ? `${simulatedMatches.length} matching permission${simulatedMatches.length === 1 ? '' : 's'} found.`
                        : simulatorDecision === 'review'
                          ? 'Elevated matching permissions require policy review.'
                          : 'No selected permission grants this action.'}
                    </span>
                  </div>
                </div>
                {simulatedMatches.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {simulatedMatches.slice(0, 6).map(permission => (
                      <span key={permission.id} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
                        {permission.module}: {permission.action}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-muted-foreground hover:bg-card rounded-md">Cancel</button>
            <button onClick={handleCreateRole} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary">
              <Save className="w-4 h-4" /> Save Custom Role
            </button>
          </div>
        </div>
      </GlobalDrawer>

      <div className="bg-card/50 rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-card/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Permissions Count</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-transparent">
            {roles.map(role => (
              <tr key={role.id} className="hover:bg-card/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-foreground text-sm">{role.name}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                  <span className="bg-primary/40 text-primary border border-primary/50 py-1 px-3 rounded-full text-xs font-semibold">
                    {role.permissions?.length || 0} Permissions
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {pendingDeleteId === role.id ? (
                    <div className="inline-flex items-center justify-end gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1">
                      <span className="text-xs font-medium text-destructive">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(role.id)}
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
                      onClick={() => setPendingDeleteId(role.id)}
                      aria-label={`Delete role ${role.name}`}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-all inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground italic text-sm">
                  No custom roles defined. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
