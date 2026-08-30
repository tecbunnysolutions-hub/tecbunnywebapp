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

export const TRUST_POINTS = [
  {
    title: 'Registered Corporate Entity',
    desc: 'TecBunny Solutions Pvt. Ltd. is a fully registered Indian enterprise holding valid GSTIN and corporate certifications in Goa.',
    icon: Building2,
    badge: 'Legal & Tax Compliant'
  },
  {
    title: 'Certified Engineering Team',
    desc: 'Our on-site field engineers carry certifications across enterprise routing, structured cabling, and physical security standards.',
    icon: Award,
    badge: 'Technical Competence'
  },
  {
    title: 'Tier-1 OEM Hardware Partners',
    desc: 'We deploy genuine enterprise equipment sourced from authorized distributors of Cisco, Ubiquiti, Hikvision, Dahua, and Honeywell.',
    icon: Cpu,
    badge: '100% Genuine'
  },
  {
    title: 'Structured Engineering Blueprints',
    desc: 'Every project receives formal CAD/topology diagrams, patch panel port mappings, and cable certification reports upon handover.',
    icon: Layers,
    badge: 'Clear Documentation'
  },
  {
    title: 'Local Spares & Fast Response',
    desc: 'We maintain on-shelf spare inventory in North Goa fulfillment hubs to minimize downtime during unexpected component failures.',
    icon: Clock,
    badge: 'Local Inventory'
  },
  {
    title: 'Transparent Invoicing & SLAs',
    desc: 'Clear, itemized Bill of Materials with zero hidden fees, GST input tax credits, and defined response windows in every service agreement.',
    icon: FileCheck,
    badge: 'Defensible Value'
  },
];

export function TrustSection({
  title = "Why Organizations Partner With TecBunny",
  subtitle = "We engineer enterprise systems built for long-term reliability, grounded in authentic technical standards and local support.",
  className = ""
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section className={`py-16 sm:py-20 bg-zinc-950/40 border-y border-zinc-900 ${className}`}>
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
            Proven Standards
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-2xl border border-zinc-850 bg-[#09090B] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/20 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                      {point.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-tech">
                    {point.title}
                  </h3>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
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
