'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Terminal, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ComintPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium tracking-wide">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          <span>SYSTEM_MODULE :: COMINT_V1</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 font-sans">
          COMINT Control & Intelligence
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Communications & Telemetry Signals Engine. Real-time system diagnostics, enterprise event ingestion, and API command routing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Cpu className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Signal Monitoring</h3>
            <p className="text-xs text-zinc-400 mt-1">High-frequency payload parsing and proxy telemetry aggregation.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Zap className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Realtime Stream</h3>
            <p className="text-xs text-zinc-400 mt-1">Instant webhook dispatching and automated anomaly detection.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Governance & Audit</h3>
            <p className="text-xs text-zinc-400 mt-1">Encrypted log vaults and compliance-enforced signal tracing.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <span>Access Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
