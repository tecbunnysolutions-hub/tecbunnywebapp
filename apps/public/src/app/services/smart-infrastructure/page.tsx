import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Zap,
  Cpu,
  Wifi,
  Server,
  Eye,
  Key,
  Smartphone,
  Sliders,
  Building,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Network,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Next-Gen Smart Infrastructure for Hotels & Builders | TecBunny',
    description: 'Enterprise-grade technology integration for hotels, resorts, and modern real estate builders. CCTV, RFID access, smart automation, and IT networking in Goa.',
    keywords: [
      'smart infrastructure Goa',
      'hotel automation',
      'CCTV projects Goa',
      'RFID hotel locks',
      'hospitality IT infrastructure',
      'GRMS system',
      'structured cabling',
      'TecBunny'
    ],
    path: '/services/smart-infrastructure',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "What does 'All-in-One Smart Infrastructure Integration' mean?",
    answer: "Instead of hiring separate vendors for CCTV, network cables, smart locks, Wi-Fi, and lighting automation, TecBunny provides unified engineering under one contract. All systems share structured conduits, clean server racks, and one master account manager."
  },
  {
    question: "How early in construction should we engage TecBunny?",
    answer: "Engaging us during the architectural CAD and MEP (Mechanical, Electrical, Plumbing) rough-in stage ensures all low-voltage conduits, backboxes, and server room cooling ducts are placed correctly before plastering, saving up to 40% in rework costs."
  },
  {
    question: "What service response times are covered under eligible enterprise SLA plans?",
    answer: "Under eligible enterprise SLA plans, clients receive priority support routing, routine preventive audits, and same-day emergency on-site technician dispatch in Goa."
  },
  {
    question: "Can your systems be monitored remotely across multiple properties?",
    answer: "Yes, our integrated solutions support unified cloud dashboards, allowing owners to view CCTV feeds, access logs, and energy usage metrics across multiple resorts or office buildings from one screen."
  }
];

export default function SmartInfrastructurePage() {
  const services = [
    {
      title: "CCTV Elite Projects",
      subtitle: "High-Definition surveillance engineered for expansive properties & complex layouts.",
      icon: Shield,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "AI-Powered Surveillance",
          desc: "Smart analytics including facial recognition, perimeter intrusion alerts, and crowd management."
        },
        {
          label: "Property-Wide Coverage",
          desc: "Seamlessly integrated IP-based networks designed for dependable coverage across large resort layouts."
        },
        {
          label: "Centralized Control Rooms",
          desc: "Customized monitoring hubs with secure, high-capacity local and cloud storage solutions."
        }
      ]
    },
    {
      title: "Hotel RFID Locks & Access Systems",
      subtitle: "Modern, secure, and friction-free access control tailored for hospitality.",
      icon: Lock,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "Contactless Smart Locks",
          desc: "Heavy-duty, aesthetically designed RFID card locks that blend beautifully with luxury interiors."
        },
        {
          label: "Centralized Management",
          desc: "Instantly issue, revoke, or track room access keys from the front desk management software."
        },
        {
          label: "Future-Proof Mobile Access",
          desc: "Ready for quick upgrade to BLE (Bluetooth) smartphone-based keyless entry system."
        }
      ]
    },
    {
      title: "Hotel Complete Smart Lights & Automation",
      subtitle: "Transform guest experiences while optimizing operational energy costs.",
      icon: Zap,
      gradient: "from-warning/20 via-accent/10 to-transparent",
      border: "hover:border-warning/35",
      points: [
        {
          label: "Intelligent Guestroom Automation (GRMS)",
          desc: "Welcome scenes that auto-activate lighting, climate, and motorized curtains upon check-in."
        },
        {
          label: "Centralized Energy Optimization",
          desc: "Auto-adjust HVAC and lighting in unoccupied rooms, dramatically reducing utility bills."
        },
        {
          label: "Premium Custom Switch Panels",
          desc: "Sleek capacitive touch glass switchboards fully branded and back-lit for intuitive guest control."
        }
      ]
    },
    {
      title: "IT Services & Network Infrastructure",
      subtitle: "Enterprise-grade digital foundation to keep your property running flawlessly.",
      icon: Server,
      gradient: "from-success/20 via-success/10 to-transparent",
      border: "hover:border-success/35",
      points: [
        {
          label: "Resilient High-Density Wi-Fi",
          desc: "Engineered access point grids providing high-throughput connectivity for hundreds of concurrent devices."
        },
        {
          label: "Structured Cabling & Server Racks",
          desc: "Clean Cat6/Fiber optic backbone infrastructure that simplifies ongoing maintenance and upgrades."
        },
        {
          label: "Proactive AMC & SLA Support",
          desc: "Dedicated monitoring and support delivered under eligible enterprise SLA plans."
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Services', url: 'https://www.tecbunny.com/services' },
          { name: 'Smart Infrastructure', url: 'https://www.tecbunny.com/services/smart-infrastructure' },
        ]}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span>Next-Gen Smart Infrastructure Integration</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Next-Gen Smart Infrastructure <br />
              <span className=" text-primary">
                for Hotels &amp; Builders
              </span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Turnkey technology engineering for modern real estate developments, luxury resorts, and commercial complexes in Goa. One unified partner for CCTV, RFID access, smart lighting, and enterprise networking.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-primary/20">
                <Link href="#assessment-funnel">Get a Free Infrastructure Assessment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore Unified Capabilities &darr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="py-16 sm:py-20 border-b border-border bg-background/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono">
              Infrastructure Complexity
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              Why Multi-Vendor Approaches Fail in New Construction
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Eliminate vendor finger-pointing, mismatched conduits, and expensive post-construction cutting.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">01 / Unified</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Vendor Finger-Pointing</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                When the camera, door lock, and Wi-Fi vendors blame each other for network lag, your project stalls. TecBunny acts as your single accountable engineering partner.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">02 / Conduits</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Post-Plaster Cable Chasing</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Forgetting low-voltage cabling before plastering damages interior aesthetics. We integrate with architects at the blueprint stage to pre-lay all conduits.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">03 / Lifecycle</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Unmaintained Systems Post-Handover</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Many contractors disappear after final payment. We provide continuous support under eligible enterprise SLA plans with dedicated on-site technicians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Integrated Modules</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Our Smart Infrastructure Capabilities</h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base font-light">
              High-definition IP surveillance, RFID hospitality locks, intelligent room automation, and enterprise networking managed as one coherent ecosystem.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-3xl border border-border bg-background/60 p-8 sm:p-10 transition-all duration-300 ${service.border} group`}
                >
                  <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${service.gradient} blur-3xl opacity-60 pointer-events-none transition-all duration-300 group-hover:scale-110`} />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border text-foreground">
                        <Icon size={22} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-tech mb-2">{service.title}</h3>
                      <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed max-w-md">{service.subtitle}</p>

                      <div className="space-y-4 border-t border-border pt-6">
                        {service.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex gap-4">
                            <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-foreground tracking-wide">{pt.label}</h4>
                              <p className="text-xs text-muted-foreground font-light leading-relaxed">{pt.desc}</p>
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
      <HowItWorksSection
        variant="canonical-link"
        title="How a smart infrastructure project runs"
        subtitle="Room-by-room design, GRMS installation, and commissioning — see the full lifecycle on our services page."
      />

      {/* Trust Section */}
      <TrustSection />

      {/* FAQ Section with JSON-LD Schema */}
      <section className="py-16 sm:py-20 border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono flex items-center gap-2">
              <HelpCircle size={14} /> Clear Answers
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              Frequently Asked Questions: Smart Infrastructure
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background/60 p-6 space-y-2">
                <h3 className="text-sm font-bold text-foreground font-tech">{faq.question}</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">{faq.answer}</p>
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
      <section id="assessment-funnel" className="py-16 sm:py-24 bg-background/20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Proposal Intake</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Request Smart Infrastructure Survey</h2>
            <p className="text-muted-foreground text-sm sm:text-base font-light">
              Submit your property specifications below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="smart-infrastructure" sourceContext="service_smart_infrastructure" />
        </div>
      </section>
    </div>
  );
}
