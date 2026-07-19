'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@tecbunny/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card, Button, Input, Skeleton, Textarea, useToast,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@tecbunny/ui';
import {
  Users, Search, Plus, Phone, Mail, MapPin,
  TrendingUp, UserCheck, RefreshCw, Filter,
} from 'lucide-react';

interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  status?: string;
  heat_level?: string;
  lead_score?: number;
  sub_category?: string;
  source_name?: string;
  created_at?: string;
  address?: string;
}

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  QUALIFIED: 'bg-emerald-100 text-emerald-700',
  CONVERTED: 'bg-green-100 text-green-700',
  DEAD: 'bg-zinc-200 text-zinc-500',
  LOST: 'bg-red-100 text-red-600',
};

const contactSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required').max(120),
  lastName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  companyName: z.string().trim().max(160).optional(),
  sourceName: z.string().trim().max(120).optional(),
  requirement: z.string().trim().max(1000).optional(),
}).refine((value) => Boolean(value.phone?.trim() || value.email?.trim()), {
  message: 'Add either phone or email',
  path: ['phone'],
});

type ContactFormValues = z.infer<typeof contactSchema>;
type CreateMode = 'lead' | 'customer';

function ContactRow({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.phone || '—';
  const statusClass = STATUS_BADGE[contact.status ?? 'NEW'] ?? 'bg-slate-100 text-slate-600';

  return (
    <tr
      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="font-medium text-sm text-slate-800">{name}</div>
        {contact.sub_category && (
          <div className="text-xs text-slate-400">{contact.sub_category}</div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1">
          {contact.phone && (
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[180px]">
              <Mail className="w-3 h-3" /> {contact.email}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
          {contact.status ?? 'NEW'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${contact.lead_score ?? 0}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{contact.lead_score ?? 0}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400">
        {contact.created_at ? new Date(contact.created_at).toLocaleDateString('en-IN') : '—'}
      </td>
    </tr>
  );
}

function ContactRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
      ))}
    </tr>
  );
}

function CreateContactDialog({
  open,
  mode,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  mode: CreateMode;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyName: '',
      sourceName: 'Management CRM',
      requirement: '',
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyName: '',
      sourceName: 'Management CRM',
      requirement: '',
    });
  }, [form, open, mode]);

  const onSubmit = async (values: ContactFormValues) => {
    const response = await fetch('/api/admin/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, mode }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Unable to save contact');
    }

    toast({
      title: payload.isNew ? `${mode === 'customer' ? 'Customer' : 'Lead'} created` : 'Existing contact updated',
      description: `${values.firstName} is now available in CRM.`,
    });
    onCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{mode === 'customer' ? 'Create Customer' : 'Create Lead'}</DialogTitle>
          <DialogDescription>
            Capture a CRM contact with enough detail for follow-up and assignment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl><Input placeholder="Amit" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl><Input placeholder="Sharma" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="name@company.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl><Input placeholder="Acme Retail" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sourceName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl><Input placeholder="Walk-in, referral, campaign" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="requirement" render={({ field }) => (
              <FormItem>
                <FormLabel>Requirement</FormLabel>
                <FormControl><Textarea placeholder="What does this contact need?" rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : mode === 'customer' ? 'Create Customer' : 'Create Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CrmDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createMode, setCreateMode] = React.useState<CreateMode>('lead');
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 25;

  const fetchContacts = React.useCallback(async (q = '', status = 'ALL', pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from('sls_leads')
        .select('id, first_name, last_name, phone, email, status, heat_level, lead_score, sub_category, source_name, created_at, address', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE - 1);

      if (status !== 'ALL') query = query.eq('status', status);

      if (q.trim()) {
        const term = q.trim();
        query = query.or(
          `first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`
        );
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      setContacts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContacts(search, statusFilter, page);
  }, [fetchContacts, search, statusFilter, page]);

  // Handle ?action=new-lead from FAB
  React.useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-lead' || action === 'new-customer') {
      setCreateMode(action === 'new-customer' ? 'customer' : 'lead');
      setCreateOpen(true);
    }
  }, [searchParams]);

  const openCreate = React.useCallback((mode: CreateMode) => {
    setCreateMode(mode);
    router.push(`/mgmt/crm?action=${mode === 'customer' ? 'new-customer' : 'new-lead'}`);
  }, [router]);

  const handleCreateOpenChange = React.useCallback((open: boolean) => {
    setCreateOpen(open);
    if (!open && searchParams.get('action')) {
      router.replace('/mgmt/crm');
    }
  }, [router, searchParams]);

  const handleContactCreated = React.useCallback(() => {
    setPage(1);
    fetchContacts(search, statusFilter, 1);
  }, [fetchContacts, search, statusFilter]);

  const stats = React.useMemo(() => {
    const qualified = contacts.filter(c => c.status === 'QUALIFIED').length;
    const converted = contacts.filter(c => c.status === 'CONVERTED').length;
    const hot = contacts.filter(c => c.heat_level === 'HOT').length;
    return { total: contacts.length, qualified, converted, hot };
  }, [contacts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> CRM — Contacts &amp; Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">All leads and customers in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContacts(search, statusFilter, page)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => openCreate('customer')}>
            <UserCheck className="w-4 h-4 mr-2" /> New Customer
          </Button>
          <Button size="sm" onClick={() => openCreate('lead')}>
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>

      <CreateContactDialog
        open={createOpen}
        mode={createMode}
        onOpenChange={handleCreateOpenChange}
        onCreated={handleContactCreated}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: stats.total, icon: Users, color: 'text-indigo-700' },
          { label: 'Hot Leads', value: stats.hot, icon: TrendingUp, color: 'text-orange-600' },
          { label: 'Qualified', value: stats.qualified, icon: Filter, color: 'text-emerald-600' },
          { label: 'Converted', value: stats.converted, icon: UserCheck, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                {loading
                  ? <Skeleton className="h-7 w-10 mt-1" />
                  : <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
                }
              </div>
              <Icon className={`w-5 h-5 opacity-50 ${color}`} />
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, email…"
            className="pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">All Statuses</option>
          {['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'DEAD'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Contact', 'Details', 'Status', 'Score', 'Created'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ContactRowSkeleton key={i} />)
                : contacts.map(c => (
                    <ContactRow
                      key={c.id}
                      contact={c}
                      onClick={() => router.push(`/mgmt/crm/${c.id}`)}
                    />
                  ))
              }
            </tbody>
          </table>
        </div>

        {!loading && contacts.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No contacts found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        {contacts.length === PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-slate-500">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
