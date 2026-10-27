import React from 'react';
import {
  Building2,
  Award,
  ShieldCheck,
  Layers,
  Clock,
  Cpu,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { UNVERIFIED_WORDING } from '@tecbunny/core/verified-credentials';

export const TRUST_POINTS = [
 { title: 'A local point of contact', desc: 'Discuss your requirements with our Goa-based team and confirm the service area for your project.', icon: Building2, badge: 'Based in Pernem' },
 { title: 'Options explained clearly', desc: 'Review what the proposed setup is intended to do, the equipment involved and the practical trade-offs.', icon: Award, badge: 'Clear recommendations' },
 { title: 'Equipment matched to the job', desc: 'Choose products around the site, the users and the outcome you need. Ask about the applicable warranty before ordering.', icon: Cpu, badge: 'Purpose before specification' },
 { title: 'A written scope', desc: 'Check the proposed equipment, installation and exclusions in your quote before approving the work.', icon: Layers, badge: 'Know what is included' },
 { title: 'Support discussed upfront', desc: 'Ask how to report a fault, what support is included and which work needs a separate service arrangement.', icon: Clock, badge: 'Practical next steps' },
 { title: 'Business details you can check', desc: 'View our business information and ask for the billing and warranty details relevant to your purchase.', icon: FileCheck, badge: 'Clear paperwork' },
];

export function TrustSection({
  title = "Choose with confidence.",
  subtitle = "Understand the scope, the choices and the next step before you commit.",
  className = "",
  variant = "full"
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'full' | 'compact';
}) {
  // Compact mode shows the three strongest trust points in a tighter layout.
  const points = variant === 'compact' ? TRUST_POINTS.slice(0, 3) : TRUST_POINTS;
  const isCompact = variant === 'compact';

  return (
    <section className={`${isCompact ? 'py-10 sm:py-14' : 'py-16 sm:py-24'} bg-background border-y border-border ${className}`}>
      <div className="container mx-auto px-6 max-w-screen-2xl">
        {/* Premium Intro Container */}
        <div className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background/30 to-background ${isCompact ? 'p-6 sm:p-8 mb-8' : 'p-8 sm:p-10 mb-14'}`}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <ShieldCheck size={13} />
              What to expect
            </div>
            <div>
              <h2 className={`${isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold text-foreground font-tech tracking-tight`}>
                {title}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mb-12" />

        <div className={`grid gap-6 sm:grid-cols-2 ${isCompact ? 'lg:grid-cols-3' : 'lg:grid-cols-3'}`}>
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-border hover:bg-card/20 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border bg-card/80 text-muted-foreground font-mono">
                      {point.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground font-tech">
                    {point.title}
                  </h3>

                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
