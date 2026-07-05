'use client';

import * as React from 'react';
import { MapPin, Plus, RefreshCcw, Save, Trash2, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type Staff = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  role: string;
};

type Area = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  services_enabled: boolean;
  sales_manager_id?: string | null;
  service_manager_id?: string | null;
  pincodes: string[];
  salesTeamIds: string[];
  serviceEngineerIds: string[];
  postalLocations: Array<{
    pincode: string;
    office_name: string;
    block_taluka?: string | null;
    district?: string | null;
    state?: string | null;
    division?: string | null;
    region?: string | null;
    circle?: string | null;
    branch_type?: string | null;
    delivery_status?: string | null;
  }>;
};

type FormState = {
  id: string | null;
  code: string;
  name: string;
  isActive: boolean;
  servicesEnabled: boolean;
  pincodesText: string;
  salesManagerId: string;
  serviceManagerId: string;
  salesTeamIds: string[];
  serviceEngineerIds: string[];
};

const EMPTY_FORM: FormState = {
  id: null,
  code: '',
  name: '',
  isActive: true,
  servicesEnabled: false,
  pincodesText: '',
  salesManagerId: '',
  serviceManagerId: '',
  salesTeamIds: [],
  serviceEngineerIds: [],
};

const displayName = (staff: Staff) =>
  staff.full_name || staff.name || staff.email || staff.mobile || staff.id;

export default function SuperadminAreasPage() {
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!form.id && !form.name && !form.code) {
      const match = form.pincodesText.match(/^[1-9][0-9]{5}/);
      if (match) {
        const pincode = match[0];
        fetch(`https://api.postalpincode.in/pincode/${pincode}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
              const office = data[0].PostOffice[0];
              const regionName = office.Block || office.Name || office.District || '';
              setForm(current => {
                if (current.name || current.code) return current;
                return {
                  ...current,
                  name: regionName,
                  code: regionName.toUpperCase().replace(/[^A-Z0-9_\-\s]/g, '')
                };
              });
            }
          })
          .catch(err => console.error('Failed to auto-fetch postal details', err));
      }
    }
  }, [form.pincodesText, form.id, form.name, form.code]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/superadmin/areas', { credentials: 'include' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to load area configuration');
      setAreas(payload.areas || []);
      setStaff(payload.staff || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not load areas',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const salesManagers = staff.filter((item) => item.role === 'sales_manager');
  const serviceManagers = staff.filter((item) => item.role === 'service_manager');
  const salesTeam = staff.filter((item) => ['sales_executive', 'store_executive', 'sales_agent'].includes(item.role));
  const serviceEngineers = staff.filter((item) => item.role === 'service_engineer');

  const editArea = (area: Area) => setForm({
    id: area.id,
    code: area.code,
    name: area.name,
    isActive: area.is_active,
    servicesEnabled: area.services_enabled,
    pincodesText: area.pincodes.join(', '),
    salesManagerId: area.sales_manager_id || '',
    serviceManagerId: area.service_manager_id || '',
    salesTeamIds: area.salesTeamIds || [],
    serviceEngineerIds: area.serviceEngineerIds || [],
  });

  const toggleMember = (field: 'salesTeamIds' | 'serviceEngineerIds', id: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      [field]: checked
        ? Array.from(new Set([...current[field], id]))
        : current[field].filter((value) => value !== id),
    }));
  };

  const saveArea = async () => {
    const pincodes = form.pincodesText
      .split(/[\s,;]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const invalidPincode = pincodes.find((value) => !/^[1-9][0-9]{5}$/.test(value));
    if (!form.code.trim() || !form.name.trim() || invalidPincode) {
      toast({
        variant: 'destructive',
        title: 'Check area details',
        description: invalidPincode
          ? `${invalidPincode} is not a valid six-digit pincode.`
          : 'Area code and name are required.',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/superadmin/areas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          code: form.code.trim(),
          name: form.name.trim(),
          isActive: form.isActive,
          servicesEnabled: form.servicesEnabled,
          pincodes,
          salesManagerId: form.salesManagerId || null,
          serviceManagerId: form.serviceManagerId || null,
          salesTeamIds: form.salesTeamIds,
          serviceEngineerIds: form.serviceEngineerIds,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save area');
      toast({ title: 'Area saved', description: 'Managers, team members, and pincodes are now assigned.' });
      setForm(EMPTY_FORM);
      await load();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Area save failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteArea = async (area: Area) => {
    if (!window.confirm(`Delete ${area.name}? Its pincode and team assignments will also be removed.`)) return;
    const response = await fetch(`/api/superadmin/areas?id=${encodeURIComponent(area.id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const payload = await response.json();
    if (!response.ok) {
      toast({ variant: 'destructive', title: 'Delete failed', description: payload.error || 'Could not delete area' });
      return;
    }
    if (form.id === area.id) setForm(EMPTY_FORM);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Areas & Teams</h1>
          <p className="text-muted-foreground">
            Superadmin-only regional ownership for sales, stores, agents, and service operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => setForm(EMPTY_FORM)}>
            <Plus className="mr-2 h-4 w-4" /> New Area
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Configured Areas</CardTitle>
            <CardDescription>Select an area to edit its pincode and team ownership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => editArea(area)}
                className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${form.id === area.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{area.name}</p>
                    <p className="text-xs text-muted-foreground">{area.code}</p>
                  </div>
                  <Badge variant={area.is_active ? 'default' : 'secondary'}>{area.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {area.pincodes.length} pincodes · {area.salesTeamIds.length} sales staff · {area.serviceEngineerIds.length} engineers
                </p>
                <p className={`mt-1 text-xs ${area.services_enabled ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  Service orders {area.services_enabled ? 'enabled' : 'disabled'}
                </p>
              </button>
            ))}
            {!loading && areas.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No areas configured yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> {form.id ? 'Edit Area' : 'Create Area'}
              </CardTitle>
              <CardDescription>Area code, display name, and exact six-digit pincodes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="area-code">Area Code</Label>
                  <Input id="area-code" placeholder="GOA-NORTH" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area-name">Area Name</Label>
                  <Input id="area-name" placeholder="North Goa" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincodes">Pincodes</Label>
                <Input id="pincodes" placeholder="403512, 403507, 403516" value={form.pincodesText} onChange={(event) => setForm({ ...form, pincodesText: event.target.value })} />
                <p className="text-xs text-muted-foreground">Separate pincodes with commas, spaces, or semicolons.</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                <Label>Area is active</Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Switch
                  checked={form.servicesEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, servicesEnabled: checked })}
                />
                <div>
                  <Label>Accept service orders in this area</Label>
                  <p className="text-xs text-muted-foreground">
                    Service tickets and service-only orders are rejected for this area when disabled.
                  </p>
                </div>
              </div>

              {form.id && (
                <PostalLocations area={areas.find((item) => item.id === form.id) || null} />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <TeamCard
              title="Sales Team"
              managerLabel="Sales Manager"
              managerId={form.salesManagerId}
              managers={salesManagers}
              members={salesTeam}
              selectedIds={form.salesTeamIds}
              onManagerChange={(value) => setForm({ ...form, salesManagerId: value })}
              onMemberChange={(id, checked) => toggleMember('salesTeamIds', id, checked)}
            />
            <TeamCard
              title="Service Team"
              managerLabel="Service Manager"
              managerId={form.serviceManagerId}
              managers={serviceManagers}
              members={serviceEngineers}
              selectedIds={form.serviceEngineerIds}
              onManagerChange={(value) => setForm({ ...form, serviceManagerId: value })}
              onMemberChange={(id, checked) => toggleMember('serviceEngineerIds', id, checked)}
            />
          </div>

          <div className="flex justify-end gap-2">
            {form.id && (
              <Button variant="destructive" onClick={() => {
                const area = areas.find((item) => item.id === form.id);
                if (area) void deleteArea(area);
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
            <Button onClick={() => void saveArea()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save Area & Teams'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  title,
  managerLabel,
  managerId,
  managers,
  members,
  selectedIds,
  onManagerChange,
  onMemberChange,
}: {
  title: string;
  managerLabel: string;
  managerId: string;
  managers: Staff[];
  members: Staff[];
  selectedIds: string[];
  onManagerChange: (value: string) => void;
  onMemberChange: (id: string, checked: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {title}</CardTitle>
        <CardDescription>Select one manager and the staff operating in this area.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{managerLabel}</Label>
          <Select value={managerId || '__none__'} onValueChange={(value) => onManagerChange(value === '__none__' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder={`Select ${managerLabel}`} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not assigned</SelectItem>
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>{displayName(manager)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Team Members</Label>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
            {members.map((member) => (
              <label key={member.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                <Checkbox
                  checked={selectedIds.includes(member.id)}
                  onCheckedChange={(checked) => onMemberChange(member.id, checked === true)}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{displayName(member)}</span>
                  <span className="block text-xs text-muted-foreground">{member.role.replaceAll('_', ' ')} · {member.email || member.mobile}</span>
                </span>
              </label>
            ))}
            {members.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No eligible staff found.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostalLocations({ area }: { area: Area | null }) {
  if (!area) return null;
  return (
    <div className="space-y-2">
      <Label>India Postal Directory</Label>
      <p className="text-xs text-muted-foreground">
        Refreshed from api.postalpincode.in whenever this area is saved.
      </p>
      <div className="max-h-72 overflow-auto rounded-lg border">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="p-2">Pincode</th>
              <th className="p-2">Village / Post Office</th>
              <th className="p-2">Taluka / Block</th>
              <th className="p-2">District</th>
              <th className="p-2">State</th>
            </tr>
          </thead>
          <tbody>
            {(area.postalLocations || []).map((location) => (
              <tr key={`${location.pincode}-${location.office_name}`} className="border-t">
                <td className="p-2 font-mono">{location.pincode}</td>
                <td className="p-2">{location.office_name}</td>
                <td className="p-2">{location.block_taluka || '—'}</td>
                <td className="p-2">{location.district || '—'}</td>
                <td className="p-2">{location.state || '—'}</td>
              </tr>
            ))}
            {!area.postalLocations?.length && (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Save the area to fetch postal locations.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
