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
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

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
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
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
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
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
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
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
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
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
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultService="Smart Access Control" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Biometrics, RFID Locks &amp; Barrier Control</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Smart Access Control &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Biometric Systems
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Secure your facilities with friction-free biometric entry, high-speed facial recognition, hotel RFID locks, pedestrian speed gates, and automated parking barrier systems in Goa.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Plan Your Access Control System</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore Access Solutions &darr;</Link>
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
              Access Challenges
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              What Access Control Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Eliminate physical key management headaches, buddy-punching, and unverified entries.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">01 / Security</div>
              <h3 className="text-lg font-bold text-white font-tech">Lost Physical Keys &amp; Rekeying Costs</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Lost physical keys require expensive rekeying of door locks. Smart RFID and biometric systems allow instant card revocation with a single click.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">02 / Auditing</div>
              <h3 className="text-lg font-bold text-white font-tech">Unverified Server &amp; Store Access</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Traditional locks leave zero trace of who opened the server room or pharmacy. Our controllers record time-stamped digital audit logs for every access event.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">03 / Throughput</div>
              <h3 className="text-lg font-bold text-white font-tech">Slow Morning Attendance Queues</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Sluggish fingerprint readers cause frustrating entry lines. Our 0.2-second facial recognition terminals process staff instantly without physical contact.
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Access Control Capabilities</h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base font-light">
              Biometric scanners, European mortise hotel locks, motorized turnstiles, and automated vehicle gates.
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
              Frequently Asked Questions: Smart Access Control
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Plan Your Access Control System</h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Submit your property specifications below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="smart-access-control" sourceContext="service_access_control" />
        </div>
      </section>
    </div>
  );
}
