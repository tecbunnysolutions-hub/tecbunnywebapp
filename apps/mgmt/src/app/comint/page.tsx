import React from 'react';
import Link from 'next/link';
import { Signal, Radio, BarChart3, ArrowRight, Activity } from 'lucide-react';

export const metadata = {
  title: 'COMINT | Management Intelligence Workspace',
  description: 'TecBunny Management COMINT Hub - Operations Signals & Communication Analytics',
};

export default function MgmtComintPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium tracking-wide">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>MGMT_MODULE :: COMINT_OPS</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-sky-400 font-sans">
          Management COMINT Intelligence
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Operational communication intelligence hub. Unified view for manager alerts, lead signals, and business telemetry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Signal className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Lead Signal Dispatch</h3>
            <p className="text-xs text-zinc-400 mt-1">Automated triage for inbound sales and customer inquiries.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Activity className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Operations Health</h3>
            <p className="text-xs text-zinc-400 mt-1">Real-time tracking of staff activities and order fulfillments.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <BarChart3 className="w-6 h-6 text-violet-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Metrics Engine</h3>
            <p className="text-xs text-zinc-400 mt-1">Aggregated operational KPIs and predictive trend analysis.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/mgmt"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-600/20"
          >
            <span>Return to Management Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
