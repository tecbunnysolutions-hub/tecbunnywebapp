'use client';
import { createClient } from '@tecbunny/database';



import * as React from 'react';

import { Columns3, Download, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tecbunny/ui";
import { Badge } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tecbunny/ui";
import { Skeleton } from "@tecbunny/ui";
import { trackProductEvent } from "@tecbunny/ui";
import type { Order, OrderType, OrderStatus } from '@tecbunny/core';
import { useToast } from "@tecbunny/ui";
import { OrderActions } from './OrderActions';
import { formatOrderNumber } from "@tecbunny/core/order-utils";


const STATUS_VARIANT: Record<OrderStatus, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  'Pending': 'outline',
  'Awaiting Payment': 'destructive',
  'Payment Failed': 'destructive',
  'Payment Confirmed': 'default',
  'Confirmed': 'default',
  'Processing': 'default',
  'Ready to Ship': 'default',
  'Shipped': 'secondary',
  'Ready for Pickup': 'default',
  'Ready for Delivery': 'default',
  'Delivered': 'outline',
  'Delivered/Picked Up': 'outline',
  'Completed': 'outline',
  'On Hold': 'outline',
  'Visit Scheduled': 'default',
  'Visit Completed': 'default',
  'Diagnosis Done': 'default',
  'Quote Sent': 'default',
  'Awaiting Customer Approval': 'default',
  'Approved': 'default',
  'Parts Ordered': 'default',
  'Work In Progress': 'default',
  'Quality Check': 'default',
  'Warranty/Support Active': 'default',
  'Cancelled': 'destructive',
  'Rejected': 'destructive',
};

const TYPE_BADGE_CLASS: Record<OrderType, string> = {
  Delivery: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  Pickup: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  'Walk-in': 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  Service: 'bg-primary/10 text-primary border border-primary/20',
  Repair: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  Installation: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  Setup: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
};

type TypeFilter = 'all' | OrderType;
type TableDensity = 'comfortable' | 'compact';
type OrderColumnKey = 'order' | 'customer' | 'type' | 'date' | 'status' | 'payment' | 'total';

interface OrderDataTableProps {
  role: 'ADMIN' | 'SALES';
}

type SavedOrderView = {
  id: string;
  name: string;
  searchTerm: string;
  typeFilter: TypeFilter;
  limit: number;
  density?: TableDensity;
  visibleColumns?: OrderColumnKey[];
};

const ORDER_VIEW_STORAGE_KEY = 'tecbunny.orderDataTable.savedViews.v1';
const DEFAULT_ORDER_COLUMNS: OrderColumnKey[] = ['order', 'customer', 'type', 'date', 'status', 'payment', 'total'];
const ORDER_COLUMN_LABELS: Record<OrderColumnKey, string> = {
  order: 'Order ID',
  customer: 'Customer',
  type: 'Type',
  date: 'Placed',
  status: 'Status',
  payment: 'Payment',
  total: 'Total',
};

function escapeCsvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function OrderDataTable({ role }: OrderDataTableProps) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalOrders, setTotalOrders] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [savedViews, setSavedViews] = React.useState<SavedOrderView[]>([]);
  const [activeSavedViewId, setActiveSavedViewId] = React.useState('__none__');
  const [newViewName, setNewViewName] = React.useState('');
  const [density, setDensity] = React.useState<TableDensity>('comfortable');
  const [visibleColumns, setVisibleColumns] = React.useState<Set<OrderColumnKey>>(new Set(DEFAULT_ORDER_COLUMNS));
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();
  const fetchControllerRef = React.useRef<AbortController | null>(null);
  const supabase = createClient();

  const fetchOrders = React.useCallback(async () => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    setLoading(true);

    try {
      if (role === 'ADMIN') {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (typeFilter !== 'all') {
          params.set('type', typeFilter);
        }

        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load orders. Please try again.');
        }

        setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
        const pagination = payload?.pagination;
        setTotalOrders(pagination?.total ?? (payload?.orders?.length ?? 0));
        setTotalPages(Math.max(1, pagination?.pages ?? 1));
      } else {
        // SALES role fetching logic
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            // Using logic from sales-orders.tsx to fetch Pickup orders or apply filters
            .eq('type', typeFilter !== 'all' ? typeFilter : 'Pickup')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error('Failed to fetch orders. Please try again.');
        } else {
            setOrders(data as Order[]);
            setTotalOrders(data.length);
            setTotalPages(1);
        }
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      console.error(`Error fetching ${role.toLowerCase()} orders:`, error);
      toast({
        variant: 'destructive',
        title: 'Order fetch failed',
        description: error instanceof Error ? error.message : 'Unable to load orders. Please try again.',
      });
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
        setLoading(false);
      }
    }
  }, [limit, page, toast, typeFilter, role, supabase]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  React.useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    try {
      const rawViews = window.localStorage.getItem(`${ORDER_VIEW_STORAGE_KEY}.${role}`);
      const parsedViews = rawViews ? JSON.parse(rawViews) : [];
      setSavedViews(Array.isArray(parsedViews) ? parsedViews : []);
    } catch {
      setSavedViews([]);
    }
  }, [role]);

  const persistSavedViews = React.useCallback((views: SavedOrderView[]) => {
    setSavedViews(views);
    window.localStorage.setItem(`${ORDER_VIEW_STORAGE_KEY}.${role}`, JSON.stringify(views));
  }, [role]);

  const saveCurrentView = React.useCallback(() => {
    const name = newViewName.trim();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Add a saved view name before saving this table setup.',
      });
      return;
    }

    const view: SavedOrderView = {
      id: `${Date.now()}`,
      name,
      searchTerm,
      typeFilter,
      limit,
      density,
      visibleColumns: Array.from(visibleColumns),
    };
    const nextViews = [...savedViews.filter((savedView) => savedView.name.toLowerCase() !== name.toLowerCase()), view];
    persistSavedViews(nextViews);
    trackProductEvent('order_table_view_saved', {
      role,
      typeFilter,
      limit,
      visibleColumns: Array.from(visibleColumns).join(','),
      density,
    });
    setActiveSavedViewId(view.id);
    setNewViewName('');
    toast({ title: 'View saved', description: `${name} is ready for reuse.` });
  }, [density, limit, newViewName, persistSavedViews, savedViews, searchTerm, toast, typeFilter, visibleColumns]);

  const applySavedView = React.useCallback((viewId: string) => {
    setActiveSavedViewId(viewId);
    if (viewId === '__none__') return;

    const view = savedViews.find((savedView) => savedView.id === viewId);
    if (!view) return;

    setSearchTerm(view.searchTerm);
    setTypeFilter(view.typeFilter);
    setLimit(view.limit);
    setDensity(view.density ?? 'comfortable');
    setVisibleColumns(new Set(view.visibleColumns?.length ? view.visibleColumns : DEFAULT_ORDER_COLUMNS));
    setPage(1);
  }, [savedViews]);

  const resetTableView = React.useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setLimit(20);
    setDensity('comfortable');
    setVisibleColumns(new Set(DEFAULT_ORDER_COLUMNS));
    setPage(1);
    setActiveSavedViewId('__none__');
    toast({ title: 'View reset', description: 'Order table filters returned to the default setup.' });
  }, [toast]);

  const deleteActiveSavedView = React.useCallback(() => {
    const view = savedViews.find((savedView) => savedView.id === activeSavedViewId);
    if (!view) {
      toast({ variant: 'destructive', title: 'No saved view selected', description: 'Select a saved view before deleting it.' });
      return;
    }

    persistSavedViews(savedViews.filter((savedView) => savedView.id !== view.id));
    setActiveSavedViewId('__none__');
    toast({ title: 'View deleted', description: `${view.name} was removed from saved views.` });
  }, [activeSavedViewId, persistSavedViews, savedViews, toast]);

  const filteredOrders = React.useMemo(() => {
    const typeFiltered = role === 'ADMIN' && typeFilter !== 'all'
      ? orders.filter(order => order.type === typeFilter)
      : orders;

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return typeFiltered;

    return typeFiltered.filter((order) => {
      const searchableText = [
        formatOrderNumber(order.id),
        order.id,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.type,
        order.status,
        order.payment_method,
        order.payment_status,
        order.payment_reference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [orders, searchTerm, typeFilter, role]);

  const selectedOrders = React.useMemo(
    () => filteredOrders.filter((order) => selectedOrderIds.has(order.id)),
    [filteredOrders, selectedOrderIds]
  );

  const getStatusBadgeVariant = (status: OrderStatus) => STATUS_VARIANT[status] ?? 'outline';

  const getTypeBadgeClass = (type: OrderType | null | undefined) => {
    if (!type || !(type in TYPE_BADGE_CLASS)) {
      return 'bg-gray-100 text-gray-700';
    }
    return TYPE_BADGE_CLASS[type as OrderType];
  };

  const getStatusLabel = (order: Order) => {
    if (['Awaiting Payment', 'Pending'].includes(order.status) && (order.payment_method ?? '').toLowerCase() === 'upi') {
      return 'Payment Confirmation Pending';
    }
    return order.status;
  };

  const toggleColumn = (column: OrderColumnKey) => {
    setVisibleColumns((current) => {
      const next = new Set(current);
      if (next.has(column) && next.size > 1) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const isColumnVisible = (column: OrderColumnKey) => {
    if (role !== 'ADMIN' && (column === 'type' || column === 'payment')) return false;
    return visibleColumns.has(column);
  };

  const visibleColumnCount = DEFAULT_ORDER_COLUMNS.filter(isColumnVisible).length + 1;
  const densityCellClass = density === 'compact' ? 'px-2 py-2' : 'px-2 py-3';

  const getPaymentStatusLabel = (order: Order) => {
    if (order.payment_status && order.payment_status.trim().length > 0) {
      return order.payment_status;
    }

    if (['Awaiting Payment', 'Pending'].includes(order.status)) {
      return (order.payment_method ?? '').toLowerCase() === 'upi'
        ? 'Payment Confirmation Pending'
        : 'Awaiting Payment';
    }

    if (['Payment Confirmed', 'Confirmed', 'Processing', 'Ready to Ship', 'Shipped', 'Ready for Pickup', 'Completed', 'Delivered'].includes(order.status)) {
      return 'Payment Confirmed';
    }

    if (['Cancelled', 'Rejected'].includes(order.status)) {
      return 'Payment Cancelled';
    }

    return 'Pending';
  };

  const exportCurrentView = React.useCallback(() => {
    exportOrders(filteredOrders, 'loaded');
  }, [filteredOrders, toast]);

  const exportSelectedOrders = React.useCallback(() => {
    exportOrders(selectedOrders, 'selected');
  }, [selectedOrders, toast]);

  function exportOrders(ordersToExport: Order[], scope: 'loaded' | 'selected') {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Type', 'Placed', 'Status', 'Payment Method', 'Payment Status', 'Total'];
    const rows = ordersToExport.map((order) => [
      formatOrderNumber(order.id),
      order.customer_name || 'Unknown customer',
      order.customer_email || '',
      order.customer_phone || '',
      order.type || '',
      order.created_at ? new Date(order.created_at).toISOString() : '',
      getStatusLabel(order),
      order.payment_method || '',
      getPaymentStatusLabel(order),
      order.total?.toFixed(2) ?? '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tecbunny-orders-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export ready', description: `${ordersToExport.length} ${scope} order${ordersToExport.length === 1 ? '' : 's'} exported.` });
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleAllVisibleOrders = () => {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      const allSelected = filteredOrders.length > 0 && filteredOrders.every((order) => next.has(order.id));
      if (allSelected) filteredOrders.forEach((order) => next.delete(order.id));
      else filteredOrders.forEach((order) => next.add(order.id));
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{role === 'ADMIN' ? 'Order Management' : 'Pickup Orders'}</h1>
          <p className="text-muted-foreground">
            {role === 'ADMIN' 
              ? 'Monitor and control every order across the storefront.' 
              : 'Manage and track orders designated for in-store pickup.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {role === 'ADMIN' && (
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setPage(1);
                setTypeFilter(value as TypeFilter);
              }}
            >
              <SelectTrigger className="min-w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All order types</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Pickup">Pickup</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Installation">Installation</SelectItem>
                <SelectItem value="Setup">Setup</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={fetchOrders}
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        </div>
      </div>

      {role === 'ADMIN' ? (
        <Card className="border-l-2 border-l-primary bg-primary/5 border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              Admins can review, update, and cancel any order. Use the actions menu in each row to adjust order status,
              print invoices, or drill into a full order view.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-2 border-l-emerald-500 bg-emerald-500/5 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <div>
                <p className="font-medium text-foreground">Sales & Manager Access</p>
                <p className="text-sm text-muted-foreground">You can view and manage all pickup order statuses.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{role === 'ADMIN' ? 'Orders' : 'Active Pickup Orders'}</CardTitle>
          <CardDescription>
            {role === 'ADMIN' ? 'Recent orders across all channels.' : 'A list of all current pickup orders.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order, customer, payment, or status"
                  className="pl-9"
                  aria-label="Search orders on this page"
                />
              </div>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing {loading ? '...' : filteredOrders.length} of {orders.length} loaded orders
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 md:flex-row md:items-center">
              <Select value={activeSavedViewId} onValueChange={applySavedView}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Saved views" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No saved view</SelectItem>
                  {savedViews.map((view) => (
                    <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={newViewName}
                onChange={(event) => setNewViewName(event.target.value)}
                placeholder="Name this table view"
                className="md:max-w-xs"
                aria-label="Saved view name"
              />
              <Button type="button" variant="outline" onClick={saveCurrentView}>
                Save View
              </Button>
              <Button type="button" variant="outline" onClick={resetTableView} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button type="button" variant="outline" onClick={deleteActiveSavedView} disabled={activeSavedViewId === '__none__'} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete View
              </Button>
              <Button type="button" variant="outline" onClick={exportCurrentView} disabled={filteredOrders.length === 0} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2" aria-label="Visible order table columns">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Columns3 className="h-4 w-4" /> Columns
                </span>
                {DEFAULT_ORDER_COLUMNS.filter(column => role === 'ADMIN' || (column !== 'type' && column !== 'payment')).map((column) => (
                  <button
                    key={column}
                    type="button"
                    onClick={() => toggleColumn(column)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${visibleColumns.has(column) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    {ORDER_COLUMN_LABELS[column]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Density</span>
                {(['comfortable', 'compact'] as TableDensity[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDensity(option)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${density === option ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedOrders.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 rounded-md border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-foreground">
                {selectedOrders.length} order{selectedOrders.length === 1 ? '' : 's'} selected for bulk action
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={exportSelectedOrders} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedOrderIds(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="grid gap-3 md:hidden">
              {filteredOrders.map((order) => (
                <article key={`mobile-${order.id}`} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{formatOrderNumber(order.id)}</p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{order.customer_name || 'Unknown customer'}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order)}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Type: <strong className="text-foreground">{order.type || 'Unknown'}</strong></span>
                    <span>Total: <strong className="text-foreground">₹{order.total?.toLocaleString() ?? '0'}</strong></span>
                    <span className="col-span-2">Payment: <strong className="text-foreground">{getPaymentStatusLabel(order)}</strong></span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <OrderActions order={order} onStatusUpdate={fetchOrders} variant="dropdown" />
                  </div>
                </article>
              ))}
              <div className="sticky bottom-3 z-10 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{filteredOrders.length} loaded order{filteredOrders.length === 1 ? '' : 's'}</p>
                    <p className="text-[11px] text-muted-foreground">Mobile operations view</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                      <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={exportCurrentView} disabled={filteredOrders.length === 0}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-full overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all loaded orders"
                    checked={filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderIds.has(order.id))}
                    onChange={toggleAllVisibleOrders}
                  />
                </TableHead>
                {isColumnVisible('order') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Order ID</TableHead>}
                {isColumnVisible('customer') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Customer</TableHead>}
                {isColumnVisible('type') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Type</TableHead>}
                {isColumnVisible('date') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">{role === 'ADMIN' ? 'Placed' : 'Date'}</TableHead>}
                {isColumnVisible('status') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Status</TableHead>}
                {isColumnVisible('payment') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Payment</TableHead>}
                {isColumnVisible('total') && <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Total</TableHead>}
                <TableHead className="px-2 py-3 text-right text-xs sm:text-sm font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`order-skeleton-${index}`}>
                    <TableCell className={densityCellClass}><Skeleton className="h-4 w-4" /></TableCell>
                    {isColumnVisible('order') && <TableCell className={densityCellClass}><Skeleton className="h-5 w-24" /></TableCell>}
                    {isColumnVisible('customer') && <TableCell className={densityCellClass}>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </TableCell>}
                    {isColumnVisible('type') && <TableCell className={densityCellClass}><Skeleton className="h-5 w-16" /></TableCell>}
                    {isColumnVisible('date') && <TableCell className={densityCellClass}><Skeleton className="h-5 w-24" /></TableCell>}
                    {isColumnVisible('status') && <TableCell className={densityCellClass}><Skeleton className="h-6 w-24" /></TableCell>}
                    {isColumnVisible('payment') && <TableCell className={densityCellClass}><Skeleton className="h-5 w-20" /></TableCell>}
                    {isColumnVisible('total') && <TableCell className={densityCellClass}><Skeleton className="h-5 w-16" /></TableCell>}
                    <TableCell className={`${densityCellClass} text-right`}><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount + 1} className="py-12 text-center text-muted-foreground">
                    No orders found for the selected filter or search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className={densityCellClass}>
                      <input
                        type="checkbox"
                        aria-label={`Select order ${formatOrderNumber(order.id)}`}
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                    </TableCell>
                    {isColumnVisible('order') && <TableCell className={`font-medium ${densityCellClass} text-xs sm:text-sm whitespace-nowrap`}>{formatOrderNumber(order.id)}</TableCell>}
                    {isColumnVisible('customer') && <TableCell className={`${densityCellClass} max-w-[150px] lg:max-w-[200px]`}>
                      <div className="space-y-0.5 truncate">
                        <p className="font-medium text-xs sm:text-sm truncate" title={order.customer_name || 'Unknown customer'}>
                          {order.customer_name || 'Unknown customer'}
                        </p>
                        {order.customer_email && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={order.customer_email}>
                            {order.customer_email}
                          </p>
                        )}
                        {order.customer_phone && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={order.customer_phone}>
                            {order.customer_phone}
                          </p>
                        )}
                      </div>
                    </TableCell>}
                    {isColumnVisible('type') && (
                      <TableCell className={`${densityCellClass} text-xs sm:text-sm whitespace-nowrap`}>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${getTypeBadgeClass(order.type)}`}>
                          {order.type || 'Unknown'}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('date') && <TableCell className={`${densityCellClass} text-xs sm:text-sm whitespace-nowrap`}>
                      <div>
                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>}
                    {isColumnVisible('status') && <TableCell className={`${densityCellClass} text-xs sm:text-sm`}>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="text-[10px] sm:text-xs px-2 py-0.5 whitespace-nowrap">
                        {role === 'ADMIN' ? getStatusLabel(order) : order.status}
                      </Badge>
                    </TableCell>}
                    {isColumnVisible('payment') && (
                      <TableCell className={`${densityCellClass} max-w-[120px] lg:max-w-[150px]`}>
                        <div className="space-y-0.5 text-[11px] sm:text-xs truncate">
                          <p className="font-medium truncate">{order.payment_method ? order.payment_method.toUpperCase() : 'Not set'}</p>
                          <p className="text-muted-foreground truncate" title={getPaymentStatusLabel(order)}>{getPaymentStatusLabel(order)}</p>
                          {order.payment_reference && (
                            <p className="text-[10px] text-muted-foreground truncate" title={`Ref: ${order.payment_reference}`}>Ref: {order.payment_reference}</p>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible('total') && <TableCell className={`${densityCellClass} text-xs sm:text-sm whitespace-nowrap`}>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">₹{order.total.toFixed(2)}</p>
                        {role === 'ADMIN' && (order.discount_amount || order.shipping_amount) && (
                          <p className="text-[10px] text-muted-foreground">
                            {order.discount_amount ? `Disc: ₹${order.discount_amount.toFixed(2)}` : ''}
                            {order.shipping_amount ? ` Ship: ₹${order.shipping_amount.toFixed(2)}` : ''}
                          </p>
                        )}
                        {role === 'SALES' && order.payment_method && (
                          <p className="text-[10px] text-muted-foreground">{order.payment_method}</p>
                        )}
                      </div>
                    </TableCell>}
                    <TableCell className={`${densityCellClass} text-right whitespace-nowrap`}>
                      <OrderActions order={order} onStatusUpdate={fetchOrders} variant="dropdown" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          {!loading && role === 'ADMIN' && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • {totalOrders} orders
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setPage(1);
                    setLimit(Number(value));
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rows per page" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1 || loading}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
