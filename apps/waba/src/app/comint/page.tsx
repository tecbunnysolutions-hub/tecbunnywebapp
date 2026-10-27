'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Bot, Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function WabaComintPage() {
  return (
    <main className="min-h-screen bg-background text-muted-foreground flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),hsl(var(--foreground) / 0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-mono font-medium tracking-wide">
          <MessageSquare className="w-3.5 h-3.5 animate-pulse" />
          <span>WABA_MODULE :: COMINT_DESK</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight       font-sans text-primary">
          WhatsApp COMINT Intelligence
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          WhatsApp Business API Signals Engine. Multi-agent conversation routing, automated triage, and broadcast intelligence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl hover:border-border transition-colors">
            <Bot className="w-6 h-6 text-success mb-3" />
            <h3 className="text-sm font-semibold text-foreground">AI Agent Triage</h3>
            <p className="text-xs text-muted-foreground mt-1">Autonomous message classification and agent escalation rules.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl hover:border-border transition-colors">
            <Sparkles className="w-6 h-6 text-warning mb-3" />
            <h3 className="text-sm font-semibold text-foreground">Smart Copilot</h3>
            <p className="text-xs text-muted-foreground mt-1">Contextual response drafting and instant customer history lookup.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl hover:border-border transition-colors">
            <Zap className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-sm font-semibold text-foreground">Broadcast Engine</h3>
            <p className="text-xs text-muted-foreground mt-1">High-throughput campaign delivery tracking and read receipt analytics.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-success hover:bg-success text-success-foreground font-medium text-sm transition-all shadow-lg shadow-success/20"
          >
            <span>Open WhatsApp Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
