import * as React from 'react';

export interface ActivityItem {
    id: string;
    type: string;
    description: string;
    date: string;
    status: string;
}

export interface RecentActivityTableProps {
    activities: ActivityItem[];
}

export default function RecentActivityTable({ activities }: RecentActivityTableProps) {
    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30';
            case 'pending':
                return 'bg-amber-500/10 text-amber-300 border border-amber-500/30';
            case 'cancelled':
                return 'bg-red-500/10 text-red-300 border border-red-500/30';
            default:
                return 'bg-white/5 text-slate-300 border border-white/10';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-muted text-xs uppercase font-bold text-muted-foreground">
                    <tr>
                        <th className="px-6 py-4">Activity</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-foreground">{activity.description}</p>
                                    <p className="text-xs font-mono text-muted-foreground">#{activity.id}</p>
                                </td>
                                <td className="px-6 py-4">{activity.type}</td>
                                <td className="px-6 py-4">
                                    {new Date(activity.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider ${statusBadgeClass(activity.status)}`}>
                                        {activity.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-6 text-center text-muted-foreground">
                                No recent activity to display.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
