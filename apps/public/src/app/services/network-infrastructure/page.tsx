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
  Database,
  Layers,
  HelpCircle
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Business Network & IT Infrastructure Solutions Goa | TecBunny',
    description: 'Enterprise-grade network design, Cat6/fiber structured cabling, core switching, next-gen firewalls, dual-ISP auto failover, and high-density Wi-Fi 6 in Goa.',
    keywords: [
      'network design Goa',
      'structured cabling Goa',
      'core routing switching',
      'managed switches',
      'enterprise firewalls',
      'business wifi Goa',
      'server infrastructure',
      'TecBunny'
    ],
    path: '/services/network-infrastructure',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "How do you calculate the required number of Wi-Fi access points for our office or resort?",
    answer: "During our physical on-site survey, we map floorplans, wall materials (such as Portuguese laterite stone), and peak user device counts to calculate precise radio frequency (RF) heatmaps that guarantee zero dead zones."
  },
  {
    question: "What brand hardware do you supply and configure?",
    answer: "We supply and configure Tier-1 OEM enterprise equipment including Ubiquiti UniFi, Cisco, Fortinet, Digisol, and HFCL IO, sourced through authorized national distributors with full warranty support."
  },
  {
    question: "How does dual-ISP automatic failover work?",
    answer: "We install a multi-WAN hardware router that monitors primary and secondary internet lines (e.g. Airtel fiber + backup broadband). If the primary line drops, active traffic switches in milliseconds without interrupting video calls or cloud database sessions."
  },
  {
    question: "Do your cable installations come certified?",
    answer: "Yes, every single Cat6, Cat6A, and optical fiber run is terminated to numbered patch panels and tested to Fluke performance standards with full certification reports provided upon project handover."
  }
];

export default function NetworkInfrastructurePage() {
  const subServices = [
    {
      title: "Core Routing & Managed Switching",
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
          label: "Link Aggregation & LACP",
          desc: "Combine multiple physical network links into one logical channel to boost bandwidth and support auto-failover."
        },
        {
          label: "Enterprise Layer 2/3 Switching",
          desc: "Deployment of high-capacity managed switches with automated QoS traffic prioritization."
        }
      ]
    },
    {
      title: "Structured Cabling & 10G Fiber Optics",
      subtitle: "Certified physical layer planning and clean execution to support decades of operations.",
      icon: Server,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Cat6 & Fiber Deployments",
          desc: "Industrial-grade copper and multi-mode fiber optic runs providing high speeds and complete EMI resistance."
        },
        {
          label: "Clean Server Rack Architectures",
          desc: "Proper patch panel layout, clear labeling, cable management tracks, and systemized server racks."
        },
        {
          label: "Fluke Performance Certification",
          desc: "Full testing and certification of every cable run to guarantee maximum performance and zero line noise."
        }
      ]
    },
    {
      title: "Next-Gen Firewalls & Cybersecurity",
      subtitle: "Active security gates protecting your local assets from cloud threats and unauthorized probes.",
      icon: Shield,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Intrusion Prevention (IPS)",
          desc: "Real-time deep packet inspection detecting and neutralizing network threats before they hit your nodes."
        },
        {
          label: "Secure Site-to-Site & Remote VPNs",
          desc: "Encrypted SSL tunnels connecting head offices, remote warehouses, and remote employee laptops."
        },
        {
          label: "Unified Threat Management (UTM)",
          desc: "Integrated antivirus, web category filtering, and application control on a single hardware firewall platform."
        }
      ]
    },
    {
      title: "Enterprise Wi-Fi 6 & Wireless Mesh",
      subtitle: "High-density access points ensuring perfect coverage across expansive building layouts.",
      icon: Wifi,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "Sub-50ms Seamless Roaming",
          desc: "Walk across multi-floor offices or resort layouts without losing active VoIP calls or server sessions."
        },
        {
          label: "Dynamic RF Optimization",
          desc: "Automated channel scanning and power adjustments to bypass local frequency interference."
        },
        {
          label: "Managed Guest Captive Portals",
          desc: "Secure, throttled guest Wi-Fi networks requiring OTP registration or terms acceptance."
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultService="Network Infrastructure" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Core Enterprise Networking &amp; Cabling</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Business Network &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Infrastructure Solutions
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              We design, deploy, and maintain high-speed, secure, and resilient corporate networks with structured cabling, multi-WAN failover, and high-density Wi-Fi that keep your business operations running with zero bottlenecks.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Request a Network Assessment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore Offerings &darr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve (Pain Points) */}
      <section className="py-16 sm:py-20 border-b border-zinc-900 bg-zinc-950/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
              Business Pain Points
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              What Networking Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Eliminate the daily IT frustrations that stall commercial operations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">01 / Outages</div>
              <h3 className="text-lg font-bold text-white font-tech">Single ISP Drops &amp; Zoom Freezes</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                When single internet lines cut, operations freeze. We implement automated dual-ISP failover that switches backup lines in milliseconds with zero dropped sessions.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">02 / Coverage</div>
              <h3 className="text-lg font-bold text-white font-tech">Dead Zones in Thick Stone Walls</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Goa laterite walls degrade standard Wi-Fi. We engineer high-density access point grids with sub-50ms roaming so clients and staff stream seamlessly across the property.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">03 / Clutter</div>
              <h3 className="text-lg font-bold text-white font-tech">Unorganized Server Racks &amp; Noise</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Tangled, unlabelled cables cause hours of diagnostic delays. We install clean, color-coded patch panels, ventilated racks, and Fluke-certified runs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-blue-400 font-bold font-mono">Offerings</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Core Infrastructure Capabilities</h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base font-light">
              Tailored networking infrastructure designed to reduce latency, prevent downtime, and scale seamlessly with your enterprise.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {subServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className={`relative overflow-hidden rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10 transition-all duration-300 ${service.border} group`}
                >
                  <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${service.gradient} blur-3xl opacity-60 pointer-events-none transition-all duration-300 group-hover:scale-110`} />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-white">
                        <Icon size={22} className="text-zinc-200" />
                      </div>
                      <h3 className="text-xl font-bold text-white font-tech mb-2">{service.title}</h3>
                      <p className="text-zinc-300 text-sm font-light mb-8 leading-relaxed max-w-md">{service.subtitle}</p>
                      
                      <div className="space-y-4 border-t border-zinc-900 pt-6">
                        {service.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex gap-4">
                            <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
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

      {/* Structured 8-Step Lifecycle */}
      <HowItWorksSection />

      {/* Trust Section */}
      <TrustSection />

      {/* FAQ Section with JSON-LD Schema */}
      <section className="py-16 sm:py-20 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono flex items-center gap-2">
              <HelpCircle size={14} /> Clear Answers
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              Frequently Asked Questions: Network Infrastructure
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-6 space-y-2">
                <h3 className="text-sm font-bold text-white font-tech">{faq.question}</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQS.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* Intake Funnel */}
      <section id="assessment-funnel" className="py-16 sm:py-24 bg-zinc-950/20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-blue-400 font-bold font-mono">Proposal Intake</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Request Core Network Survey</h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Submit your requirements below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="network-infrastructure" sourceContext="service_network_infrastructure" />
        </div>
      </section>
    </div>
  );
}
