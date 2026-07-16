'use client';

import * as React from 'react';
import { BriefcaseBusiness, Loader2, RefreshCw, Search, Wrench } from 'lucide-react';

import { Badge } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tecbunny/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import type { ContactMessage, ContactMessageStatus, InquiryCategory } from "@tecbunny/core";

type Staff = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  role: string;
};

const STATUS_OPTIONS: Array<'All' | ContactMessageStatus> = [
  'All',
  'New',
  'Assigned',
  'Contacted',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
];

const SALES_ROLES = new Set(['sales_manager', 'sales_executive', 'store_executive', 'sales_agent']);
const PAGE_SIZE = 10;

function staffName(staff: Staff) {
  return staff.full_name || staff.name || staff.email || staff.mobile || staff.id;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function originLabel(value?: string) {
  if (value === 'web_development') return 'Web Development';
  if (value === 'smart_infrastructure') return 'Smart Infrastructure';
  if (value === 'services_core_desk') return 'Services Core Desk';
  return 'General Contact';
}

function statusVariant(status: ContactMessageStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'Rejected') return 'destructive';
  if (['Resolved', 'Closed'].includes(status)) return 'outline';
  if (status === 'New') return 'secondary';
  return 'default';
}

export default function InquiryPipeline() {
  const [inquiries, setInquiries] = React.useState<ContactMessage[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/superadmin/inquiries', {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load inquiry pipelines');
      setInquiries(Array.isArray(payload.inquiries) ? payload.inquiries : []);
      setStaff(Array.isArray(payload.staff) ? payload.staff : []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Pipeline load failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const assign = async (inquiry: ContactMessage, assignedUserId: string) => {
    const previous = inquiry;
    const selectedStaff = staff.find((item) => item.id === assignedUserId);
    setUpdatingId(inquiry.id);
    setInquiries((current) => current.map((item) => item.id === inquiry.id
      ? {
          ...item,
          assigned_user_id: assignedUserId,
          handled_by_name: selectedStaff ? staffName(selectedStaff) : item.handled_by_name,
          status: item.status === 'New' ? 'Assigned' : item.status,
          assigned_at: new Date().toISOString(),
        }
      : item));

    try {
      const response = await fetch(`/api/superadmin/inquiries/${encodeURIComponent(inquiry.id)}/assignment`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUserId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Assignment failed');
      setInquiries((current) => current.map((item) => item.id === inquiry.id
        ? { ...item, ...payload.inquiry }
        : item));
      toast({
        title: 'Inquiry assigned',
        description: `${inquiry.inquiry_category || 'Sales'} ownership and status were updated.`,
      });
    } catch (error) {
      setInquiries((current) => current.map((item) => item.id === inquiry.id ? previous : item));
      toast({
        variant: 'destructive',
        title: 'Assignment failed',
        description: error instanceof Error ? error.message : 'The previous assignment was restored.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const salesStaff = staff.filter((item) => SALES_ROLES.has(item.role));
  const serviceManagers = staff.filter((item) => item.role === 'service_manager');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inquiry Pipeline</h1>
          <p className="text-muted-foreground">
            Superadmin-only routing for sales opportunities and service requests.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <PipelineGrid
        title="Sales Pipeline"
        description="Web development and sales-classified enquiries."
        category="Sales"
        icon={BriefcaseBusiness}
        inquiries={inquiries}
        assignees={salesStaff}
        loading={loading}
        updatingId={updatingId}
        onAssign={assign}
      />

      <PipelineGrid
        title="Services Desk"
        description="Smart Infrastructure and Services Core Desk enquiries."
        category="Services"
        icon={Wrench}
        inquiries={inquiries}
        assignees={serviceManagers}
        loading={loading}
        updatingId={updatingId}
        onAssign={assign}
      />
    </div>
  );
}

function PipelineGrid({
  title,
  description,
  category,
  icon: Icon,
  inquiries,
  assignees,
  loading,
  updatingId,
  onAssign,
}: {
  title: string;
  description: string;
  category: InquiryCategory;
  icon: React.ComponentType<{ className?: string }>;
  inquiries: ContactMessage[];
  assignees: Staff[];
  loading: boolean;
  updatingId: string | null;
  onAssign: (inquiry: ContactMessage, assignedUserId: string) => Promise<void>;
}) {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<'All' | ContactMessageStatus>('All');
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if ((inquiry.inquiry_category || 'Sales') !== category) return false;
      if (status !== 'All' && inquiry.status !== status) return false;
      if (!normalizedSearch) return true;
      return [
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.subject,
        inquiry.message,
        inquiry.origin_key,
        inquiry.handled_by_name,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
    });
  }, [category, inquiries, search, status]);

  React.useEffect(() => {
    setPage(1);
  }, [search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" /> {title}
            <Badge variant="secondary">{filtered.length}</Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${category.toLowerCase()} enquiries`}
              className="pl-9 sm:w-72"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Received</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead className="min-w-64">Assignment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-28 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">No matching enquiries.</TableCell></TableRow>
              ) : visibleRows.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(inquiry.created_at)}</TableCell>
                  <TableCell>
                    <p className="font-medium">{inquiry.name}</p>
                    <a href={`mailto:${inquiry.email}`} className="text-xs text-primary hover:underline">{inquiry.email}</a>
                    <p className="text-xs text-muted-foreground">{inquiry.phone || 'No mobile'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{originLabel(inquiry.origin_key)}</Badge>
                    {inquiry.utm_source && <p className="mt-1 text-xs text-muted-foreground">UTM: {inquiry.utm_source}</p>}
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="font-medium">{inquiry.subject || 'General enquiry'}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground" title={inquiry.message}>{inquiry.message}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.assigned_user_id || '__unassigned__'}
                      disabled={updatingId === inquiry.id}
                      onValueChange={(value) => {
                        if (value !== '__unassigned__') void onAssign(inquiry, value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned__" disabled>Unassigned</SelectItem>
                        {assignees.map((assignee) => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            {staffName(assignee)} · {assignee.role.replaceAll('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inquiry.status)}>{inquiry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} enquiries</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <span>Page {safePage} of {pageCount}</span>
            <Button variant="outline" size="sm" disabled={safePage >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
