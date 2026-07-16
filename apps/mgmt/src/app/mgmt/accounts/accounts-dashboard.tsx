'use client';
import { createClient } from '@tecbunny/database';
import * as React from 'react';
import { FileText, IndianRupee, PieChart, TrendingDown, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from "@tecbunny/core/hooks";
import { Skeleton } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import type { Order } from "@tecbunny/core/types";

export default function AccountsDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const supabase = React.useMemo(() => createClient(), []);
    
    const [stats, setStats] = React.useState({
        totalRevenue: 0,
        pendingPayments: 0,
        invoicesGenerated: 0,
    });
    const [recentInvoices, setRecentInvoices] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchStats = React.useCallback(async () => {
        setLoading(true);
        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const [revenueRes, pendingRes, recentRes] = await Promise.all([
                supabase
                    .from('orders')
                    .select('total')
                    .gte('created_at', startOfMonth.toISOString())
                    .in('status', ['Completed', 'Payment Confirmed']),
                supabase
                    .from('orders')
                    .select('total', { count: 'exact' })
                    .eq('payment_status', 'Pending'),
                supabase
                    .from('orders')
                    .select('id, customer_name, status, total, payment_status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            if (revenueRes.error) throw revenueRes.error;
            if (pendingRes.error) throw pendingRes.error;
            if (recentRes.error) throw recentRes.error;

            const totalRevenue = (revenueRes.data || []).reduce((sum, order) => {
                return sum + (typeof order.total === 'number' ? order.total : 0);
            }, 0);

            const pendingPayments = (pendingRes.data || []).reduce((sum, order) => {
                return sum + (typeof order.total === 'number' ? order.total : 0);
            }, 0);

            setStats({
                totalRevenue,
                pendingPayments,
                invoicesGenerated: revenueRes.data?.length || 0,
            });
            
            setRecentInvoices((recentRes.data as Order[]) || []);
        } catch (error) {
            console.error('Failed to load accounts metrics', error);
            toast({
                variant: 'destructive',
                title: 'Unable to load dashboard data',
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }, [supabase, toast]);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground tech-heading">Accounts Workspace</h1>
                    <p className="text-xs text-muted-foreground font-light mt-0.5 font-sans">
                        Financial overview, outstanding payments, and invoice tracking.
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0 animate-fade-in">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {user?.name || user?.email}
                    </span>
                    <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-blue-500">
                        Finance
                    </span>
                </div>
            </div>

            <div className="bento-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bento-card p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
                        <div className="rounded-lg bg-muted p-2 text-muted-foreground border border-border">
                            <IndianRupee className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <Skeleton className="h-8 w-28 bg-muted" />
                        ) : (
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-foreground tech-heading">
                                    ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground font-light">Confirmed this month</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bento-card p-4 sm:p-6 border-amber-500/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-amber-500">Outstanding Payments</span>
                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500 border border-amber-500/20">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <Skeleton className="h-8 w-28 bg-muted" />
                        ) : (
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-amber-500 tech-heading">
                                    ₹{stats.pendingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="mt-1 text-[10px] text-amber-500/70 font-light">Total pending collection</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bento-card p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices Generated</span>
                        <div className="rounded-lg bg-muted p-2 text-muted-foreground border border-border">
                            <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <Skeleton className="h-8 w-16 bg-muted" />
                        ) : (
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-foreground tech-heading">
                                    {stats.invoicesGenerated}
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground font-light">This month</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bento-card overflow-hidden">
                <div className="border-b border-border px-6 py-5 bg-muted/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-semibold text-foreground tech-heading">Recent Invoices & Transactions</h2>
                        <p className="text-xs text-muted-foreground mt-0.5 font-light font-sans">Latest financial activity requiring review.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md border border-border">
                            <Clock className="w-3 h-3 text-amber-500" /> Pending
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md border border-border">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Confirmed
                        </span>
                    </div>
                </div>
                
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-14 w-full bg-muted/20" />
                            <Skeleton className="h-14 w-full bg-muted/20" />
                        </div>
                    ) : recentInvoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground font-light text-sm">
                            No recent invoices found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-3 font-medium">Invoice / Order</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Payment Status</th>
                                        <th className="pb-3 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentInvoices.map((invoice) => {
                                        const isPaid = invoice.payment_status === 'Paid' || invoice.payment_status === 'Success';
                                        
                                        return (
                                            <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-4">
                                                    <div className="text-xs font-semibold text-foreground">
                                                        {invoice.customer_name || 'Customer'}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                                        INV-{invoice.id.slice(0, 8).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-xs font-light text-muted-foreground">
                                                    {new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                        {invoice.payment_status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right text-xs font-semibold text-foreground font-mono">
                                                    ₹{Number(invoice.total ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
