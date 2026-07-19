
'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const RecentActivityTable = dynamic(() => import('@tecbunny/admin-ui').then((mod) => mod.RecentActivityTable), {
    loading: () => <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">Loading activity data...</div>,
    ssr: false
});

import { Button } from "@tecbunny/ui";

interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    monthlyRevenue: number;
    monthlyOrders: number;
    lastMonthOrders: number;
    orderGrowthPercent?: number;
    recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        date: string;
        status: string;
    }>;
    recentCustomers?: Array<{ id?: string; name?: string; email?: string; mobile?: string; role?: string; created_at?: string }>;
    orderStatistics?: { byStatus: Record<string, number>; byType: Record<string, number>; byPaymentStatus: Record<string, number> };
    salesStatistics?: { selectedRangeOrders: number; averageOrderValue: number };
    financialSummary?: { selectedRangeRevenue: number; currency: string; previousPeriodOrders: number };
    pendingTasks?: Array<{ label: string; count: number; href: string }>;
    notifications?: string[];
    quickActions?: Array<{ label: string; href: string }>;
    charts?: { revenueByDay: Array<{ date: string; value: number }>; ordersByStatus: Array<{ status: string; count: number }>; ordersByType: Array<{ type: string; count: number }> };
    systemHealth?: { api: string; database: string; analytics: string; lastRefreshedAt: string };
    aiInsights?: string[];
    liveActivityFeed?: DashboardStats['recentActivity'];
    range?: { key: string; from: string; to: string };
}

export default function AdminDashboard() {
    const [stats, setStats] = React.useState<DashboardStats>({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
        lastMonthOrders: 0,
        recentActivity: []
    });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [range, setRange] = React.useState('month');

    interface DashboardResponse {
        success: boolean;
        stats?: DashboardStats;
        error?: string;
    }

    const fetchStats = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Add cache-busting parameter to force fresh data
            const response = await fetch(`/api/admin/dashboard?range=${range}&t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            let data: DashboardResponse | null = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                const rawMessage = data?.error || `HTTP error! status: ${response.status}`;
                const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
                throw new Error(message || `HTTP error! status: ${response.status}`);
            }
            
            if (data?.success && data?.stats) {
                setStats(data.stats);
            } else {
                throw new Error(data?.error || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                try {
                    setError(JSON.stringify(error));
                } catch {
                    setError('Failed to load dashboard');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [range]);

    React.useEffect(() => {
        setTimeout(() => { fetchStats(); }, 0);
    }, [fetchStats]);

    // Calculate growth indicators
    const orderGrowth = stats.lastMonthOrders > 0 
        ? ((stats.monthlyOrders - stats.lastMonthOrders) / stats.lastMonthOrders * 100).toFixed(1)
        : '0';
    const isGrowthPositive = parseFloat(orderGrowth) >= 0;
    const pendingCount = stats.recentActivity.filter((activity) => activity.status === 'pending').length;
    const completedCount = stats.recentActivity.filter((activity) => activity.status === 'completed').length;
    const averageOrderValue = stats.salesStatistics?.averageOrderValue ?? (stats.monthlyOrders > 0 ? stats.monthlyRevenue / stats.monthlyOrders : 0);
    const maxRevenuePoint = Math.max(1, ...(stats.charts?.revenueByDay ?? []).map((point) => point.value));
    const maxStatusPoint = Math.max(1, ...(stats.charts?.ordersByStatus ?? []).map((point) => point.count));
    return (
        <div className="text-foreground">
            <div className="relative">
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Admin Command</p>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">A complete overview of store operations and customer escalations.</p>
                        </div>
                        <Button
                            onClick={fetchStats}
                            disabled={loading}
                            variant="outline"
                            className="w-full gap-2 border-border bg-muted/50 text-foreground hover:bg-muted sm:w-auto"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <select
                            value={range}
                            onChange={(event) => setRange(event.target.value)}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                            aria-label="Dashboard date range"
                        >
                            <option value="week">Last 7 days</option>
                            <option value="month">This month</option>
                            <option value="quarter">This quarter</option>
                            <option value="year">This year</option>
                        </select>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
                            <p className="text-destructive">Error loading dashboard: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                                    <div className="h-4 w-24 rounded bg-muted mb-4"></div>
                                    <div className="h-8 w-20 rounded bg-muted mb-2"></div>
                                    <div className="h-3 w-28 rounded bg-muted"></div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Revenue</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</div>
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <span className={isGrowthPositive ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                                            {isGrowthPositive ? '▲' : '▼'} {orderGrowth}%
                                        </span>
                                        <span className="text-muted-foreground">vs last month</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pending Quotes</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">{pendingCount}</div>
                                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">Action Required</div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Tasks</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">{completedCount}</div>
                                    <div className="mt-2 text-xs text-muted-foreground">Completed this week</div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Orders</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">{stats.totalOrders}</div>
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                        {stats.monthlyOrders} this month
                                        {isGrowthPositive ? (
                                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-rose-500" />
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Average Order Value</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</div>
                                    <div className="mt-2 text-xs text-muted-foreground">Selected range</div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Customers</p>
                                    <div className="mt-2 text-2xl font-bold text-foreground font-tech">{stats.totalUsers}</div>
                                    <div className="mt-2 text-xs text-muted-foreground">{stats.recentCustomers?.length ?? 0} recent profiles</div>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">System Health</p>
                                    <div className="mt-2 text-2xl font-bold text-emerald-600 font-tech">Online</div>
                                    <div className="mt-2 text-xs text-muted-foreground">Analytics {stats.systemHealth?.analytics ?? 'enabled'}</div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
                        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-foreground tracking-wide">Revenue Trend</h3>
                                    <p className="text-xs text-muted-foreground">Daily revenue in the selected range</p>
                                </div>
                                <span className="text-xs font-semibold text-primary">Live API</span>
                            </div>
                            <div className="flex h-48 items-end gap-2 rounded-xl border border-border bg-muted/20 p-3">
                                {(stats.charts?.revenueByDay?.length ? stats.charts.revenueByDay : [{ date: 'No data', value: 0 }]).map((point) => (
                                    <div key={point.date} className="flex min-w-8 flex-1 flex-col items-center justify-end gap-2">
                                        <div className="w-full rounded-t bg-primary/70 transition-all" style={{ height: `${Math.max(4, (point.value / maxRevenuePoint) * 100)}%` }} />
                                        <span className="max-w-16 truncate text-[10px] text-muted-foreground">{point.date.slice(5) || point.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                            <h3 className="mb-4 font-semibold text-foreground tracking-wide">Order Status</h3>
                            <div className="space-y-3">
                                {(stats.charts?.ordersByStatus?.length ? stats.charts.ordersByStatus : [{ status: 'No data', count: 0 }]).map((point) => (
                                    <div key={point.status}>
                                        <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{point.status}</span><span className="font-semibold">{point.count}</span></div>
                                        <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(4, (point.count / maxStatusPoint) * 100)}%` }} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
                                <h3 className="font-semibold text-foreground tracking-wide">Recent Transmissions</h3>
                                <button className="text-xs text-primary hover:text-primary/80">View All</button>
                            </div>
                            <RecentActivityTable activities={stats.recentActivity} />
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <h3 className="font-semibold text-foreground tracking-wide mb-4">AI Insights</h3>
                                <div className="space-y-3">
                                    {(stats.aiInsights ?? []).map((insight) => (
                                        <div key={insight} className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground">{insight}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <h3 className="font-semibold text-foreground tracking-wide mb-4">Pending Tasks</h3>
                                <div className="space-y-2">
                                    {(stats.pendingTasks ?? []).map((task) => (
                                        <Link key={task.label} href={task.href} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted/60">
                                            <span>{task.label}</span>
                                            <span className="font-bold text-primary">{task.count}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <h3 className="font-semibold text-foreground tracking-wide mb-4">Command Protocols</h3>
                                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3">
                                    <Link href="/mgmt/admin/staff">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            Staff Management
                                        </div>
                                    </Link>
                                    <Link href="/mgmt/admin/inventory">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            Inventory Management
                                        </div>
                                    </Link>
                                    <Link href="/mgmt/admin/orders">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            All Orders
                                        </div>
                                    </Link>
                                    <Link href="/mgmt/admin/purchase">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            Purchase Entry
                                        </div>
                                    </Link>
                                    <Link href="/mgmt/admin/invoice-lookup">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            Invoice Lookup
                                        </div>
                                    </Link>
                                    <Link href="/mgmt/admin/quotes">
                                        <div className="p-3 text-center rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground cursor-pointer">
                                            Quotes Management
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <h3 className="font-semibold text-foreground tracking-wide mb-4">Inventory Watch</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Total Products</span>
                                            <span className="text-foreground font-semibold">{stats.totalProducts}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '40%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Active Users</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.totalUsers}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Monthly Orders</span>
                                            <span className="text-foreground font-semibold">{stats.monthlyOrders}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div className="bg-primary/80 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/mgmt/admin/products" className="block w-full mt-6">
                                    <div className="py-2 text-xs font-semibold text-center border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
                                        View Full Inventory
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
