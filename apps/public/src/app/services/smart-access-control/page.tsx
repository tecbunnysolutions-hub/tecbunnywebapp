import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Lock,
  Fingerprint,
  Key,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  Shield
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Smart Access Control & Biometric Systems Goa | TecBunny',
    description: 'Next-gen biometric entry, 0.2s facial recognition, RFID hotel locks, turnstiles, and automated barrier gate controllers across Goa.',
    keywords: [
      'smart access control Goa',
      'biometric entry systems',
      'facial recognition attendance',
      'RFID hotel locks Goa',
      'turnstiles Goa',
      'barrier gates',
      'TecBunny'
    ],
    path: '/services/smart-access-control',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "Can these access systems integrate with emergency fire alarms?",
    answer: "Yes, all our electromagnetic and drop-bolt locks connect directly to building fire alarm control panels (FACP) to trigger immediate, automated fail-safe unlocking during an emergency."
  },
  {
    question: "Do you supply hotel RFID door locks that support mobile smartphone keys?",
    answer: "Yes, our European-standard mortise hotel locks support standard Mifare RFID keycards and feature built-in Bluetooth Low Energy (BLE) modules for mobile phone app unlocking."
  },
  {
    question: "How does the biometric time-attendance software sync with payroll?",
    answer: "Our access control controllers export structured attendance logs automatically via API, CSV, or direct database sync with standard HRMS and payroll platforms."
  },
  {
    question: "What happens to the locks if there is a power cut?",
    answer: "We deploy central 12V/24V power supply units with built-in sealed lead-acid (SLA) or lithium battery backups that keep all doors locked and readers active for 4 to 8 hours during utility outages."
  }
];

export default function SmartAccessControlPage() {
  const subServices = [
    {
      title: "Biometric & 0.2s Facial Recognition",
      subtitle: "Secure entryways using absolute biological verification algorithms.",
      icon: Fingerprint,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "0.2s High-Speed Matching",
          desc: "Optical dual-camera scanners matching user profiles and granting access in milliseconds under any lighting."
        },
        {
          label: "Anti-Spoofing Liveness Checks",
          desc: "Active depth-sensing cameras preventing bypass using photos or digital displays."
        },
        {
          label: "Multi-Spectral Fingerprint Sensors",
          desc: "Sub-dermal scanning technology preventing fingerprint spoofing or false rejections."
        }
      ]
    },
    {
      title: "Hotel RFID Locks & PMS Integration",
      subtitle: "Contactless access control designed specifically for luxury hospitality environments.",
      icon: Key,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      border: "hover:border-primary/35",
      points: [
        {
          label: "Heavy-Duty Mortise Bodies",
          desc: "Corrosion-resistant stainless steel lock bodies engineered for coastal resort durability."
        },
        {
          label: "Front-Desk Encoder Sync",
          desc: "Instant card programming directly synchronized with your Property Management System."
        },
        {
          label: "Mobile Key Ready (BLE)",
          desc: "Upgrade path to allow guests seamless room entry via smartphone Bluetooth."
        }
      ]
    },
    {
      title: "Turnstiles & Speed Flap Gates",
      subtitle: "Automated pedestrian throughput control for corporate offices and commercial facilities.",
      icon: Shield,
      gradient: "from-success/20 via-success/10 to-transparent",
      border: "hover:border-success/35",
      points: [
        {
          label: "High-Throughput Flap Gates",
          desc: "Smooth motorized acrylic or glass flaps managing 35-40 transits per minute."
        },
        {
          label: "Anti-Tailgating Infrared Sensors",
          desc: "Multi-beam infrared arrays detecting and sounding alarms if someone tries to follow closely behind."
        },
        {
          label: "Emergency Auto-Drop Function",
          desc: "Immediate arm retraction or flap opening when fire alarms or power outages trigger."
        }
      ]
    },
    {
      title: "Automated Boom Barriers & Vehicle RFID",
      subtitle: "Intelligent parking and perimeter vehicle entry control with long-range reader tags.",
      icon: Activity,
      gradient: "from-warning/20 via-accent/10 to-transparent",
      border: "hover:border-warning/35",
      points: [
        {
          label: "High-Speed Boom Arms",
          desc: "1.5 to 3.0 second opening cycles preventing vehicle congestion at security gates."
        },
        {
          label: "UHF Long-Range Windshield Tags",
          desc: "Automated hands-free gate opening for authorized resident or staff vehicles from 6-8 meters."
        },
        {
          label: "Anti-Smash Loop Detectors",
          desc: "Inductive ground loops and safety photocells preventing the arm from lowering onto vehicles."
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden tb-page-bottom">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Services', url: 'https://www.tecbunny.com/services' },
          { name: 'Smart Access Control', url: 'https://www.tecbunny.com/services/smart-access-control' },
        ]}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      {/* Hero Section */}
      <section className="relative tb-subpage-hero border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span>Biometrics, RFID Locks &amp; Barrier Control</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Smart Access Control &amp; <br />
              <span className=" text-primary">
                Biometric Systems
              </span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Secure your facilities with friction-free biometric entry, high-speed facial recognition, hotel RFID locks, pedestrian speed gates, and automated parking barrier systems in Goa.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-primary/20">
                <Link href="#assessment-funnel">Plan Your Access Control System</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore Access Solutions &darr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="tb-section-space border-b border-border bg-background/40">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono">
              Access Challenges
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              What Access Control Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Eliminate physical key management headaches, buddy-punching, and unverified entries.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">01 / Security</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Lost Physical Keys &amp; Rekeying Costs</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Lost physical keys require expensive rekeying of door locks. Smart RFID and biometric systems allow instant card revocation with a single click.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">02 / Auditing</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Unverified Server &amp; Store Access</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Traditional locks leave zero trace of who opened the server room or pharmacy. Our controllers record time-stamped digital audit logs for every access event.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/30 p-6 space-y-3">
              <div className="text-primary font-mono font-bold text-sm">03 / Throughput</div>
              <h3 className="text-lg font-bold text-foreground font-tech">Slow Morning Attendance Queues</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Sluggish fingerprint readers cause frustrating entry lines. Our 0.2-second facial recognition terminals process staff instantly without physical contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="tb-section-space">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Offerings</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Our Access Control Capabilities</h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base font-light">
              Biometric scanners, European mortise hotel locks, motorized turnstiles, and automated vehicle gates.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {subServices.map((service, index) => {
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
        title="How an access control project runs"
        subtitle="Door audits, controller installation, and credential handover — see the full lifecycle on our services page."
      />

      {/* Trust Section */}
      <TrustSection />

      {/* FAQ Section with JSON-LD Schema */}
      <section className="tb-section-space border-b border-border">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-primary font-mono flex items-center gap-2">
              <HelpCircle size={14} /> Clear Answers
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">
              Frequently Asked Questions: Smart Access Control
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
      <section id="assessment-funnel" className="tb-section-space bg-background/20">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-primary font-bold font-mono">Proposal Intake</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">Plan Your Access Control System</h2>
            <p className="text-muted-foreground text-sm sm:text-base font-light">
              Submit your property specifications below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="smart-access-control" sourceContext="service_access_control" />
        </div>
      </section>
    </div>
  );
}
