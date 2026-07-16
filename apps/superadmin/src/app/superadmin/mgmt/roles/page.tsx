"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Save, Trash2, CheckSquare, Square } from 'lucide-react';
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
  permissions: { permission: Permission }[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

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
    if (!newRoleName) return alert("Role name is required");
    
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
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create role");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating role");
    }
  };

  // Group permissions by module
  const modules = Array.from(new Set(permissions.map(p => p.module)));

  if (loading) return <div>Loading permissions matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            Dynamic Role Builder
          </h1>
          <p className="text-gray-500 mt-1">Create and manage granular permissions for organizational roles.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Create Custom Role
          </button>
        )}
      </div>

      <GlobalDrawer 
        isOpen={isCreating} 
        onClose={() => setIsCreating(false)} 
        title="New Role Configuration"
        width="600px"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Name</label>
              <input 
                value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                placeholder="e.g. Warehouse Manager"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input 
                value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black" 
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-4">Permission Matrix</h3>
            <div className="grid grid-cols-1 gap-4">
              {modules.map(mod => (
                <div key={mod} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-gray-200 capitalize mb-3 pb-2 border-b border-gray-700">{mod}</h4>
                  <div className="flex flex-wrap gap-4">
                    {permissions.filter(p => p.module === mod).map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                        {selectedPerms.has(p.id) ? 
                          <CheckSquare className="w-5 h-5 text-indigo-400" /> : 
                          <Square className="w-5 h-5 text-gray-500" />
                        }
                        <input type="checkbox" className="hidden" checked={selectedPerms.has(p.id)} onChange={() => togglePermission(p.id)} />
                        <span className="text-sm text-gray-300 capitalize">{p.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md">Cancel</button>
            <button onClick={handleCreateRole} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
              <Save className="w-4 h-4" /> Save Custom Role
            </button>
          </div>
        </div>
      </GlobalDrawer>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map(role => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{role.name}</div>
                  <div className="text-sm text-gray-500">{role.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-xs font-medium">
                    {role.permissions?.length || 0} Permissions
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
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
