import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Cpu, 
  Settings, 
  Wrench, 
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { InfrastructureLeadForm } from '@/components/InfrastructureLeadForm';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Lifecycle Hardware Management | TecBunny Solutions',
    description: 'Enterprise IT hardware procurement, custom workstation deployments, proactive Annual Maintenance Contracts (AMC), and secure asset disposition.',
    keywords: [
      'hardware management',
      'IT procurement',
      'workstation deployment',
      'proactive AMC',
      'hardware maintenance',
      'hardware refresh',
      'corporate IT assets',
      'TecBunny'
    ],
    path: '/services/lifecycle-hardware',
    image: '/brand.png',
  });
}

export default function LifecycleHardwarePage() {
  const subServices = [
    {
      title: "Enterprise Procurement",
      subtitle: "Acquiring premium commercial desktops, laptops, and server racks at bulk wholesale pricing.",
      icon: ShoppingBag,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "Direct OEM Partnerships",
          desc: "Procure systems directly from Tier-1 manufacturers (Dell, HP, Lenovo) ensuring genuine hardware and maximum discount routing."
        },
        {
          label: "Asset Standardization",
          desc: "Select uniform workstation blueprints across departments to simplify driver mapping and system upgrades."
        },
        {
          label: "Flexible Leases & Finance",
          desc: "OpEx-friendly procurement options allowing hardware updates without high upfront capital expenditure."
        }
      ]
    },
    {
      title: "Bulk Staging & Workstation Deployment",
      subtitle: "Pre-configuring and setting up employee hardware for immediate on-site operation.",
      icon: Cpu,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Standard OS Image Staging",
          desc: "Flash custom OS images with corporate tools and security layers pre-configured before delivery."
        },
        {
          label: "On-site Desk Installation",
          desc: "Clean cable routing, physical assembly, monitor mount setups, and on-premises domain joining."
        },
        {
          label: "Handover Acceptance Logs",
          desc: "Document asset serial numbers and signed employee acceptances for your asset tracking registers."
        }
      ]
    },
    {
      title: "Proactive AMC & Field Maintenance",
      subtitle: "Preventative hardware servicing plans to maximize asset lifespans.",
      icon: Wrench,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Scheduled Physical Cleaning",
          desc: "De-dusting internal fans and vents to prevent thermal throttling and hardware degradation."
        },
        {
          label: "Component Stress Inspections",
          desc: "Diagnostic tests on SSD wear-levels, memory health, and power supply voltages to preempt failures."
        },
        {
          label: "SLA-Backed Hot Swaps",
          desc: "Temporary replacement hardware delivered instantly in case of critical device failures to keep workers active."
        }
      ]
    },
    {
      title: "Secure Decommissioning & Refresh",
      subtitle: "Safe end-of-life hardware retirement complying with strict data standards.",
      icon: Settings,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "NIST 800-88 Data Sanitization",
          desc: "Military-grade data wipes on decommissioned hard drives preventing storage leaks."
        },
        {
          label: "Eco-Friendly E-Waste Routing",
          desc: "Responsible recycling of retired hardware components following environmental standards."
        },
        {
          label: "Workstation Refresh Cycles",
          desc: "Systematic 3-to-5 year hardware refresh plans keeping your staff equipped with productive, modern units."
        }
      ]
    }
  ];

  const advantages = [
    {
      title: "Reduced Lifecycle Management Costs",
      desc: "Decrease internal IT overhead by outsourcing hardware staging, cleaning, and warranty facilitate processes."
    },
    {
      title: "Minimal Workplace Interruption",
      desc: "Workstations are pre-configured in our labs and deployed on weekends to maintain employee productivity."
    },
    {
      title: "Centralized Asset Registries",
      desc: "Every asset dispatched is cataloged with custom serial tags, ready to import into your inventory database."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pt-0 pb-16 sm:pt-0 sm:pb-24">
      {/* Background Noise and Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      {/* Ambient Blobs */}
      <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" aria-hidden="true" />
      <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-sm font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Full-Stack Device Management</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Lifecycle Hardware <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Management
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We manage your corporate technology hardware assets from wholesale OEM procurement and imaging to proactive AMC field maintenance and secure sanitization.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl px-8 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] transition-all">
                <Link href="#lead-form-section">Consult Procurement</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-2xl mb-16">
            <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">Services</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Hardware Support Modules</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              Strategic workstation deployments and proactive field maintenance plans ensuring your workforce remains fully equipped.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {subServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className={`relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950/60 p-8 transition-all duration-300 ${service.border} group`}
                >
                  <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${service.gradient} blur-3xl opacity-60 pointer-events-none transition-all duration-300 group-hover:scale-110`} />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-white">
                        <Icon size={22} className="text-zinc-200" />
                      </div>
                      <h3 className="text-xl font-bold text-white font-tech mb-2">{service.title}</h3>
                      <p className="text-zinc-300 text-base font-light mb-8 leading-relaxed max-w-md">{service.subtitle}</p>
                      
                      <div className="space-y-6 border-t border-zinc-900 pt-6">
                        {service.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex gap-4">
                            <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-base font-bold text-white tracking-wide">{pt.label}</h4>
                              <p className="text-sm text-zinc-400 font-light leading-relaxed">{pt.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 md:py-24 bg-zinc-950/40 border-y border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">Why Partner With Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech leading-tight">
                Designed for Uptime. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Built for Value.
                </span>
              </h2>
              <blockquote className="border-l-2 border-blue-500 pl-4 py-1.5 italic text-zinc-300 font-light text-base leading-relaxed">
                &ldquo;Hardware failure shouldn&apos;t put your staff out of commission. Proactive maintenance pays for itself.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-base font-light leading-relaxed">
                We handle the complete lifecycle of workstations and peripherals. Our structured AMC contracts guarantee replacement hardware access, regular dust cleaning, and secure drive wiping.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-6 md:grid-cols-1">
              {advantages.map((adv, idx) => (
                <div key={idx} className="flex gap-6 rounded-2xl border border-zinc-900 bg-[#09090B] p-6 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Activity size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white font-tech">{adv.title}</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-light">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section id="lead-form-section" className="py-16 md:py-24 border-b border-zinc-900 bg-zinc-950/20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">Proposal Intake</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Request Hardware Proposal</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              Submit details using the input columns below. Leads are routed directly to the Root Console.
            </p>
          </div>
          <InfrastructureLeadForm />
        </div>
      </section>
    </div>
  );
}
