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
  ShoppingBag,
  Clock,
  ShieldCheck,
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
    title: 'IT Lifecycle & Hardware Management Goa | TecBunny',
    description: 'Enterprise IT hardware procurement, custom workstation deployments, proactive Annual Maintenance Contracts (AMC), and local hardware spares in Goa.',
    keywords: [
      'hardware management Goa',
      'IT procurement Goa',
      'workstation deployment',
      'IT AMC contract Goa',
      'computer repair AMC Goa',
      'TecBunny'
    ],
    path: '/services/lifecycle-hardware',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "What hardware brands can TecBunny procure for our company?",
    answer: "We procure genuine Tier-1 business workstations, laptops, monitors, and servers directly from authorized enterprise channels including Dell, HP, Lenovo, Asus, and Intel."
  },
  {
    question: "What is included in an Annual Maintenance Contract (AMC)?",
    answer: "Our AMCs include scheduled monthly preventive hardware cleaning and thermal testing, operating system patch audits, unlimited remote helpdesk support, and guaranteed on-site emergency dispatch in Goa."
  },
  {
    question: "Do you keep local replacement parts in stock?",
    answer: "Yes, we maintain an inventory of standard enterprise components (RAM, NVMe SSDs, power supplies, network switches, and patch cords) at our North Goa hub to ensure same-day emergency swap-outs."
  },
  {
    question: "Can you manage workstation setups for new employee batches?",
    answer: "Yes, we handle complete device staging: flashing corporate OS images, installing security agents, configuring VPN credentials, and testing hardware before delivering ready-to-use systems to your team."
  }
];

export default function LifecycleHardwarePage() {
  const subServices = [
    {
      title: "Enterprise PC & Laptop Procurement",
      subtitle: "Acquiring commercial desktops, laptops, and server racks at wholesale corporate pricing.",
      icon: ShoppingBag,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "Authorized OEM Channels",
          desc: "Procure systems directly from Tier-1 manufacturers (Dell, HP, Lenovo) ensuring 100% genuine hardware and valid warranty coverage."
        },
        {
          label: "Standardized Fleet Blueprints",
          desc: "Select uniform workstation models across departments to simplify driver maintenance, spares, and software updates."
        },
        {
          label: "Bulk Corporate Pricing & GST Invoicing",
          desc: "Transparent commercial invoicing allowing full GST input tax credit for your business."
        }
      ]
    },
    {
      title: "Automated Staging & Deployment",
      subtitle: "Turnkey workstation preparation ensuring new systems arrive pre-configured and ready to work.",
      icon: Settings,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Golden Master Image Flashing",
          desc: "Rapid deployment of corporate OS builds, standard productivity suites, and licensed business software."
        },
        {
          label: "Endpoint Antivirus & VPN Staging",
          desc: "Pre-installing corporate security policies, firewalls, and remote access VPN tunnels."
        },
        {
          label: "Desk-Side Ergonomic Setup",
          desc: "On-site dual-monitor mounting, clean cable routing, and peripheral docking station configuration."
        }
      ]
    },
    {
      title: "Proactive IT Annual Maintenance (AMC)",
      subtitle: "Structured preventive checkups and fast troubleshooting to maximize hardware lifespan.",
      icon: Wrench,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Scheduled Preventive Audits",
          desc: "Monthly thermal paste inspection, cooling fan dusting, and disk drive health diagnostics."
        },
        {
          label: "Local Emergency Spares in Goa",
          desc: "On-shelf power supplies, RAM modules, and SSDs dispatched immediately to eliminate work stoppages."
        },
        {
          label: "Defined SLA Response Windows",
          desc: "Priority ticket routing with rapid on-site engineer dispatch for critical incidents."
        }
      ]
    },
    {
      title: "Secure Asset Refresh & E-Waste Disposal",
      subtitle: "Orderly hardware lifecycle transitions and certified data sanitization.",
      icon: Cpu,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "DoD-Standard Data Wiping",
          desc: "Multi-pass drive sanitization preventing corporate or customer data recovery from decommissioned drives."
        },
        {
          label: "Environmentally Responsible Recycling",
          desc: "Certified e-waste collection and material reclamation in compliance with environmental standards."
        },
        {
          label: "Asset Inventory Reporting",
          desc: "Complete serial number tracking and asset write-off documentation for your accounting ledger."
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

      <WhatsAppFloatingButton defaultService="IT Hardware & Workstations" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Procurement, Workstations &amp; AMC Maintenance</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Lifecycle Hardware &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Workstation Management
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Equip your workforce with Tier-1 enterprise hardware, turnkey workstation staging, proactive AMC support, and on-shelf local spares across Goa.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Discuss Your Hardware Requirements</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore Hardware Services &darr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="py-16 sm:py-20 border-b border-zinc-900 bg-zinc-950/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 font-mono">
              Hardware Friction
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              What Hardware Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Stop wasting days onboarding new employees or waiting weeks for warranty parts.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">01 / Onboarding</div>
              <h3 className="text-lg font-bold text-white font-tech">Manual Employee Laptop Setup Delays</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Manually installing software on each new hire PC takes hours. We build standardized disk images and deploy ready-to-use systems instantly.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">02 / Downtime</div>
              <h3 className="text-lg font-bold text-white font-tech">Slow 2-Week Service Center Delays</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Standard retail service centers keep laptops for weeks. Our AMC agreements provide same-day loaner systems and local spare swaps in Goa.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">03 / Reliability</div>
              <h3 className="text-lg font-bold text-white font-tech">Overheating &amp; Silent Disk Failures</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Coastal dust and heat silently degrade thermal paste and storage drives. Our proactive monthly audits replace failing components before data loss happens.
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Hardware Management Capabilities</h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base font-light">
              Enterprise procurement, custom workstation deployments, proactive AMC agreements, and certified data wiping.
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

      {/* Structured Lifecycle */}
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
              Frequently Asked Questions: Hardware &amp; AMC
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Discuss Your Hardware Requirements</h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Submit your hardware or AMC requirements below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="lifecycle-hardware" sourceContext="service_lifecycle_hardware" />
        </div>
      </section>
    </div>
  );
}
