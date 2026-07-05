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
  Database
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { InfrastructureLeadForm } from '@/components/InfrastructureLeadForm';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Network & Infrastructure Solutions | TecBunny Solutions',
    description: 'Enterprise-grade network design, structured cabling, core switching, next-gen firewalls, and server infrastructure deployments.',
    keywords: [
      'network design',
      'structured cabling',
      'core routing',
      'managed switches',
      'enterprise firewalls',
      'business wifi',
      'server infrastructure',
      'TecBunny'
    ],
    path: '/services/network-infrastructure',
    image: '/brand.png',
  });
}

export default function NetworkInfrastructurePage() {
  const subServices = [
    {
      title: "Core Routing & Switching",
      subtitle: "High-throughput backbone routing and intelligent VLAN segmentation for modern enterprises.",
      icon: Network,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "VLAN Segmentation",
          desc: "Logically isolate corporate databases, IoT devices, guest access, and POS machines to maximize security."
        },
        {
          label: "Link Aggregation",
          desc: "Combine multiple physical network links into one logical channel to boost bandwidth and support auto-failover."
        },
        {
          label: "Enterprise Switching",
          desc: "Deployment of Layer 2 and Layer 3 managed switches to ensure intelligent data path routing."
        }
      ]
    },
    {
      title: "Structured Cabling & Fiber Optics",
      subtitle: "Certified physical layer planning and clean execution to support decades of operations.",
      icon: Server,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Cat6 & Fiber Deployments",
          desc: "Industrial-grade copper and fiber optic runs providing high speeds and complete EMI resistance."
        },
        {
          label: "Clean Rack Architectures",
          desc: "Proper patch panel layout, clear labeling, cable management tracks, and systemized server racks."
        },
        {
          label: "Fluke Certification",
          desc: "Full testing and certification of every cable run to guarantee maximum performance and zero line noise."
        }
      ]
    },
    {
      title: "Next-Gen Firewalls & Cybersecurity",
      subtitle: "Active security gates protecting your local assets from cloud threats.",
      icon: Shield,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Intrusion Prevention (IPS)",
          desc: "Real-time deep packet inspections detecting and neutralizing network threats before they hit your nodes."
        },
        {
          label: "Secure Site-to-Site VPNs",
          desc: "Encrypted tunnels connecting head offices, remote warehouses, and cloud resources."
        },
        {
          label: "Unified Threat Management (UTM)",
          desc: "Integrated antivirus, web filtering, and application control on a single hardware firewall platform."
        }
      ]
    },
    {
      title: "Enterprise Wi-Fi & Wireless",
      subtitle: "High-density access points ensuring perfect coverage across office layouts.",
      icon: Wifi,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "Seamless Roaming",
          desc: "Walk across multi-floor offices or resort layouts without losing active VoIP calls or server sessions."
        },
        {
          label: "RF Optimization",
          desc: "Dynamic channel scanning and transmission adjustments to bypass local interference."
        },
        {
          label: "Managed Guest Portals",
          desc: "Secure, throttled guest Wi-Fi networks requiring OTP registration or terms acceptance."
        }
      ]
    }
  ];

  const advantages = [
    {
      title: "Certified Infrastructure Engineers",
      desc: "Our field team carries active Cisco, Sophos, and cabling certifications to ensure compliant system configurations."
    },
    {
      title: "Zero-Downtime Migration Models",
      desc: "We plan network upgrades and cutovers during maintenance windows to minimize business disruptions."
    },
    {
      title: "Active Performance Monitoring",
      desc: "Get dashboard views of bandwidth utilization, gateway ping metrics, and active connected node counts."
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
              <span>Core Enterprise Networking</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Network & Infrastructure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Solutions
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We design, deploy, and maintain high-speed, secure, and resilient corporate networks that keep your business operations running with zero bottlenecks.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] transition-all">
                <Link href="#lead-form-section">Request A Survey</Link>
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Core Infrastructure Offerings</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              Tailored networking infrastructure designed to reduce latency, prevent downtime, and scale seamlessly.
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
                Designed for Speed. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Built for Safety.
                </span>
              </h2>
              <blockquote className="border-l-2 border-blue-500 pl-4 py-1.5 italic text-zinc-300 font-light text-base leading-relaxed">
                &ldquo;A business is only as fast as its network backbone. We build highways, not footpaths.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-base font-light leading-relaxed">
                We plan out every infrastructure deployment utilizing exact blueprints and detailed bandwidth forecasts, eliminating local packet drops and slow database sync cycles.
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Request Core Network Survey</h2>
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
