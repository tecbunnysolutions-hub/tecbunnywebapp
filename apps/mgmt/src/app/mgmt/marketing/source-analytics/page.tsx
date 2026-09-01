import { Metadata } from 'next';
import { SourceAnalyticsDashboard } from './SourceAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Lead Source Analytics',
  description: 'Analyze which traffic sources generate the highest-quality leads',
};

export default function SourceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Lead Source Analytics</h1>
        <p className="text-zinc-400 mt-1">Track where your best-quality leads are coming from</p>
      </div>
      <SourceAnalyticsDashboard />
    </div>
  );
}
