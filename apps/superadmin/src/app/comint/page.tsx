import React from 'react';
import Link from 'next/link';
import { Shield, Radar, Server, ArrowRight, Lock } from 'lucide-react';

export const metadata = {
  title: 'COMINT | Superadmin Security & Infrastructure Console',
  description: 'TecBunny Superadmin COMINT - Universal Communications Intelligence & System Overwatch',
};

export default function SuperadminComintPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium tracking-wide">
          <Radar className="w-3.5 h-3.5 animate-pulse" />
          <span>SUPERADMIN :: COMINT_OVERWATCH</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-red-400 font-sans">
          Superadmin COMINT Overwatch
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Top-down platform intelligence, tenant cross-communication monitoring, and system-wide threat telemetry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Shield className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Threat Detection</h3>
            <p className="text-xs text-zinc-400 mt-1">Cross-tenant rate-limit enforcement and automated security probes.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Server className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Infrastructure Radar</h3>
            <p className="text-xs text-zinc-400 mt-1">Global database latency, proxy error budget tracking, and SLO analytics.</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-zinc-700 transition-colors">
            <Lock className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Audit Enforcement</h3>
            <p className="text-xs text-zinc-400 mt-1">Immutable platform audit logs and RBAC privilege verification.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/superadmin/mgmt/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/20"
          >
            <span>Return to Superadmin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
