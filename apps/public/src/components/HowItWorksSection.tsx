import React from 'react';
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
    desc: 'Our certified engineers conduct on-site physical surveys across Goa to map cabling paths, RF interference, and mounting zones.',
    icon: MapPin,
    badge: 'On-Site Survey'
  },
  {
    step: '03',
    title: 'Solution Design',
    desc: 'Preparation of precise network topologies, camera angle coverage heatmaps, and Bill of Materials (BOM).',
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
    desc: 'Certified deployment including clean rack architectures, structured Cat6/fiber pulls, and surge protection.',
    icon: Wrench,
    badge: 'Deployment'
  },
  {
    step: '06',
    title: 'Rigorous Testing',
    desc: 'Comprehensive Fluke cable certification, throughput load tests, VLAN isolation checks, and camera frame verification.',
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
    title: 'Direct SLA Support',
    desc: 'Continuous post-deployment support, routine maintenance audits, and rapid local engineering dispatch under clear SLAs.',
    icon: Headphones,
    badge: 'Continuous Care'
  },
];

export function HowItWorksSection({
  title = "Our Structured 8-Step Project Lifecycle",
  subtitle = "From initial property survey to ongoing SLA support, every deployment is executed with strict engineering rigor.",
  className = ""
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
            Structured Execution
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEPLOYMENT_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step}
                className="relative rounded-2xl border border-zinc-850 bg-zinc-950/60 p-6 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/40 hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all shadow-lg shadow-blue-500/20">
                      <Icon size={20} />
                    </div>
                    <span className="text-3xl font-black text-blue-500/40 font-mono group-hover:text-blue-400 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400 font-mono">
                      {item.badge}
                    </span>
                    <h3 className="text-base font-bold text-white font-tech mt-1">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
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
