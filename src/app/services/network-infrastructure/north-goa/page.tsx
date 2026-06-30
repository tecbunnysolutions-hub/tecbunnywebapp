import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Network, 
  Server, 
  Wifi, 
  Shield, 
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Building2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/metadata';
import { InfrastructureLeadForm } from '@/components/InfrastructureLeadForm';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Custom Office Networking Solutions North Goa | TecBunny Solutions',
    description: 'Bespoke corporate networking, structured cabling, enterprise Wi-Fi, and firewall setups for offices, co-working spaces, and hotels in North Goa (Panaji, Mapusa, Calangute).',
    keywords: [
      'Custom office networking solutions North Goa',
      'office networking Panaji',
      'structured cabling Mapusa',
      'hotel Wi-Fi installation Calangute',
      'corporate network setup Goa',
      'IT infrastructure Pernem',
      'TecBunny Solutions'
    ],
    path: '/services/network-infrastructure/north-goa',
    image: '/brand.png',
  });
}

export default function NorthGoaNetworkingPage() {
  const localTargetAreas = [
    { name: "Panaji (Capital)", desc: "High-density fiber optic backbone cabling, secure server racks, and VPN setups for head offices and financial hubs." },
    { name: "Mapusa & Bardez", desc: "Local corporate network designs, managed network switch migrations, and reliable multi-room office Wi-Fi." },
    { name: "Calangute & Candolim", desc: "Seamless hospitality Wi-Fi networks with custom captive portals for resorts, guest houses, and cafes." },
    { name: "Pernem & Parse", desc: "Corporate networking infrastructure, backup WAN failover, and onsite engineering deployment at our home turf." }
  ];

  const subServices = [
    {
      title: "B2B Structured Cabling & Fiber",
      subtitle: "Certified Cat6/Cat6A copper and optical fiber cabling for North Goa commercial complexes.",
      icon: Server,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "Resilient Physical Layer",
          desc: "Expert layout planning to eliminate signal crosstalk, EMI noise, and line degradation across multi-level offices."
        },
        {
          label: "Structured Server Racks",
          desc: "Clean rack organization with logical labeling, patch panels, and battery-backed UPS power rails."
        },
        {
          label: "Fluke Certification Testing",
          desc: "Every single run is tested and validated for performance certification prior to client sign-off."
        }
      ]
    },
    {
      title: "Resort & Office Guest Wi-Fi",
      subtitle: "High-density Wi-Fi access points configured for seamless indoor/outdoor roaming.",
      icon: Wifi,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "Zero-Drop Roaming",
          desc: "Resort guests and remote workers stay connected to active sessions while walking between rooms and pool zones."
        },
        {
          label: "Dynamic Bandwidth Shaping",
          desc: "Prevent bandwidth hogging by allocating bandwidth limits per user, device, or subnet."
        },
        {
          label: "OTP Captive Portals",
          desc: "Compliant guest access system requiring OTP, email, or social log-ins for audit security."
        }
      ]
    }
  ];

  const benefits = [
    {
      title: "On-Site Support Desk in Pernem",
      desc: "Our engineering operations are run from Parse, Pernem. We provide fast response times for physical audits and emergency on-site assistance in North Goa."
    },
    {
      title: "Compliant Indian Tax Invoicing",
      desc: "We supply legal tax invoices containing our registered Goa GSTIN status for seamless input tax credit recovery."
    },
    {
      title: "Enterprise Security Guardrails",
      desc: "Deploy next-gen firewalls, VLAN isolations (separating POS, guest, and internal subnets), and encrypted site VPNs."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pt-0 pb-16 sm:pt-0 sm:pb-24">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" aria-hidden="true" />
      <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-sm font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>North Goa Service Hub</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-tech leading-tight">
              Custom Office Networking <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Solutions in North Goa
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              From structured cabling in corporate parks to robust Wi-Fi grids for premium North Goa resorts, we build resilient, high-speed IT foundations.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] transition-all">
                <Link href="#lead-form-section">Schedule On-Site Audit</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Footprint Grid */}
      <section className="py-16 md:py-24 border-b border-zinc-900/50">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.45em] text-blue-500 font-bold">Regional Reach</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Catering to North Goa Businesses</h2>
            <p className="mt-4 text-zinc-400 font-light text-sm">
              We design physical-layer topologies and network controls custom-fitted for local business needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {localTargetAreas.map((area, index) => (
              <div key={index} className="flex flex-col rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-lg font-bold text-white font-tech mb-2">{area.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light mt-auto">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="max-w-2xl mb-16">
            <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">Infrastructure Offerings</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Structured IT Infrastructure</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              Optimized networking configurations designed to secure local assets, eliminate packet delay, and facilitate hybrid cloud services.
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
                      <p className="text-zinc-300 text-sm font-light mb-8 leading-relaxed max-w-md">{service.subtitle}</p>
                      
                      <div className="space-y-6 border-t border-zinc-900 pt-6">
                        {service.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex gap-4">
                            <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white tracking-wide">{pt.label}</h4>
                              <p className="text-xs text-zinc-400 font-light leading-relaxed">{pt.desc}</p>
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
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">The TecBunny Edge</span>
              <h2 className="text-3xl font-bold text-white font-tech leading-tight">
                Designed for Speed. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Built Local in Goa.
                </span>
              </h2>
              <blockquote className="border-l-2 border-blue-500 pl-4 py-1.5 italic text-zinc-300 font-light text-sm leading-relaxed">
                &ldquo;Reliability starts with proper design. We construct clean, scalable layouts for businesses that want network operations to be invisible.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-sm font-light leading-relaxed">
                As a registered Private Limited business based in Parse, we provide full GST compatibility and responsive local support that offshore consultants simply cannot match.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-6">
              {benefits.map((adv, idx) => (
                <div key={idx} className="flex gap-6 rounded-2xl border border-zinc-900 bg-[#09090B] p-6 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Building2 size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white font-tech">{adv.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed font-light">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section id="lead-form-section" className="py-16 md:py-24 border-b border-zinc-900 bg-zinc-950/20">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm uppercase tracking-[0.45em] text-blue-500 font-bold">Request a Proposal</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Request Site Network Survey</h2>
            <p className="mt-4 text-zinc-300 font-light text-sm">
              Provide details below. A certified systems engineer will connect with you to organize a physical network layout audit.
            </p>
          </div>
          <InfrastructureLeadForm />
        </div>
      </section>
    </div>
  );
}
