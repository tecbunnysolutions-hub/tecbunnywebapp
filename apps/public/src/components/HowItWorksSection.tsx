import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  FileCheck,
  MapPin,
  Layers,
  FileText,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Headphones
} from 'lucide-react';

export const DEPLOYMENT_STEPS = [
  {
    step: '01',
    title: 'Consultation',
    desc: 'Initial discovery call to assess your business requirements, existing pain points, and target timeline.',
    icon: FileCheck,
    badge: 'Discovery'
  },
  {
    step: '02',
    title: 'Site Assessment',
    desc: 'Our field engineers conduct on-site surveys in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, to map cable paths, RF interference, and equipment locations.',
    icon: MapPin,
    badge: 'On-Site Survey'
  },
  {
    step: '03',
    title: 'Solution Design',
    desc: 'Plan the relevant equipment, camera views or network layout and explain the choices in the proposal.',
    icon: Layers,
    badge: 'Engineering'
  },
  {
    step: '04',
    title: 'Transparent Proposal',
    desc: 'Formal commercial quotation detailing genuine OEM hardware, labor, GST breakdown, and clear deliverables.',
    icon: FileText,
    badge: 'Clear Pricing'
  },
  {
    step: '05',
    title: 'Professional Installation',
    desc: 'Professional deployment including clean rack architectures, structured Cat6/fiber pulls, and surge protection.',
    icon: Wrench,
    badge: 'Deployment'
  },
  {
    step: '06',
    title: 'Check the agreed functions',
    desc: 'Check the agreed functions and review the results with you. Discuss any specialist testing needed for your project.',
    icon: CheckCircle2,
    badge: 'Quality Assurance'
  },
  {
    step: '07',
    title: 'Handover & Training',
    desc: 'Delivery of as-built blueprints, administrator credentials, and hands-on system training for your on-site team.',
    icon: ShieldCheck,
    badge: 'Full Ownership'
  },
  {
    step: '08',
    title: 'Support and maintenance',
    desc: 'Review how to request support and whether a separate maintenance agreement would suit your setup.',
    icon: Headphones,
    badge: 'Continuous Care'
  },
];

export function HowItWorksSection({
  title = "From your first question to a working setup.",
  subtitle = "We work through the requirements, agree the scope and explain what happens next. The steps depend on the project.",
  className = "",
  variant = "full"
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'full' | 'compact' | 'summary' | 'canonical-link';
}) {
  // compact/summary surface the four milestone steps; full shows all eight.
  const steps = (variant === 'compact' || variant === 'summary')
    ? DEPLOYMENT_STEPS.filter((s) => ['01', '03', '05', '08'].includes(s.step)).map((s, i) => ({ ...s, step: String(i + 1).padStart(2, '0') }))
    : DEPLOYMENT_STEPS;

  // canonical-link: a short contextual pointer to the canonical process page.
  if (variant === 'canonical-link') {
    return (
      <section className={`py-10 sm:py-14 ${className}`}>
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="rounded-2xl border border-border bg-background/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono">Structured Execution</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-tech tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">{subtitle}</p>
            </div>
            <Link
              href="/services#process"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20 hover:text-primary"
            >
              See Our Full 8-Step Process <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono">
            Structured Execution
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-background/60 p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary/40 hover:bg-card/40 hover:shadow-lg hover:shadow-primary/10 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary group-hover:bg-primary group-hover:text-primary group-hover:scale-110 transition-all shadow-lg shadow-primary/20 text-foreground">
                      <Icon size={20} />
                    </div>
                    <span className="text-3xl font-black text-primary/40 font-mono group-hover:text-primary transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-primary font-mono">
                      {item.badge}
                    </span>
                    <h3 className="text-base font-bold text-foreground font-tech mt-1">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {item.desc}
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
