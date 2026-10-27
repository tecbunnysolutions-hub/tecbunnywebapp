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
                return 'bg-success/10 text-success border border-success/30';
            case 'pending':
                return 'bg-warning/10 text-warning border border-warning/30';
            case 'cancelled':
                return 'bg-destructive/10 text-destructive border border-destructive/30';
            default:
                return 'bg-card/5 text-muted-foreground border border-border/10';
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
