import { LeadCommandCenter } from '@/components/lead-command-center';

export default function LeadCommandCenterPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Lead Command Center</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Real-time dashboard for lead scoring, assignment, and pipeline management
        </p>
      </div>
      <LeadCommandCenter />
    </div>
  );
}
