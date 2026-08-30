import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Shield, 
  Eye, 
  Video, 
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Camera,
  HardDrive,
  HelpCircle,
  Lock
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { TrustSection } from '@/components/TrustSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Commercial CCTV & Physical Security Solutions Goa | TecBunny',
    description: 'Enterprise-grade IP CCTV camera networks, secure NVR arrays, AI video analytics, perimeter intrusion alarms, and low-light ColorVu security in Goa.',
    keywords: [
      'IP CCTV cameras Goa',
      'commercial surveillance Goa',
      'NVR storage arrays',
      'ColorVu security Goa',
      'perimeter security',
      'video analytics',
      'TecBunny'
    ],
    path: '/services/physical-security',
    image: '/brand.png',
  });
}

const FAQS = [
  {
    question: "Can your CCTV cameras provide full color night vision without bright white spotlights?",
    answer: "Yes, our ColorVu and dark-fighter series cameras utilize large F1.0 apertures and advanced sensor sensitivity to deliver true 24/7 full-color HD footage under starlight or ambient moonlight without blinding spotlights."
  },
  {
    question: "How much storage capacity do I need for 30 days of recording?",
    answer: "Using efficient H.265+ smart compression, an 8-camera 4MP system typically requires approximately 4TB to 6TB of surveillance-grade storage for 30 days of continuous recording. We engineer custom RAID storage arrays to fit your exact retention requirements."
  },
  {
    question: "How do you protect outdoor cameras from Goa's monsoon lightning and saline humidity?",
    answer: "We deploy IP67-rated weatherproof die-cast metal housing, sealed junction boxes with silicone gaskets, and dedicated Ethernet Surge Protection Devices (SPDs) grounded on all outdoor cable drops."
  },
  {
    question: "Can I monitor live feeds and review recordings on my smartphone?",
    answer: "Yes, all our NVR systems provide secure encrypted remote viewing apps for iOS, Android, macOS, and Windows with multi-user permission controls."
  }
];

export default function PhysicalSecurityPage() {
  const subServices = [
    {
      title: "Smart IP CCTV Networks & 4K Feeds",
      subtitle: "High-definition, low-light cameras designed to eliminate blind spots across your property boundaries.",
      icon: Camera,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "Full HD & 4K Resolution",
          desc: "Crystal-clear feeds capturing facial detail and license plate characters even in challenging low-light environments."
        },
        {
          label: "Secure Power over Ethernet (PoE)",
          desc: "Single-cable connectivity for power and gigabit data, backed up by centralized UPS nodes for continuous power."
        },
        {
          label: "Ruggedized Outdoor Housing",
          desc: "Weatherproof (IP67) and vandal-resistant metal enclosures capable of withstanding tropical coastal humidity."
        }
      ]
    },
    {
      title: "High-Capacity NVR & Local RAID Archiving",
      subtitle: "Enterprise-grade storage systems ensuring secure recording preservation and instant forensic playback.",
      icon: Video,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "RAID Redundancy Configurations",
          desc: "Local server storage arrays protecting video files from single or dual hard drive hardware failures."
        },
        {
          label: "Hybrid Cloud Offloading",
          desc: "Automatic off-site backups of critical event clips triggered by perimeter intrusion warnings."
        },
        {
          label: "End-to-End Stream Encryption",
          desc: "AES-256 video stream encryption preventing unauthorized network intercept or credential compromise."
        }
      ]
    },
    {
      title: "AI-Powered Video Analytics & Intrusion Alarms",
      subtitle: "Transforming standard surveillance feeds into active threat intelligence tools.",
      icon: Eye,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Perimeter Virtual Tripwires",
          desc: "Draw virtual boundaries that immediately alert security staff when crossed by unauthorized intruders after hours."
        },
        {
          label: "Human & Vehicle Target Filtering",
          desc: "Deep-learning algorithms that filter out falling leaves, rain, and animals to eliminate false alarm notifications."
        },
        {
          label: "Centralized Monitoring Station Setup",
          desc: "Multi-screen command hubs with HDMI matrix decoders for 24/7 security guard viewing."
        }
      ]
    },
    {
      title: "Perimeter Beam Sensors & Siren Alerts",
      subtitle: "Physical perimeter tripwires and acoustic alarms securing boundary walls and entry gates.",
      icon: Shield,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "Infrared Perimeter Beams",
          desc: "Invisible multi-beam tripwires along property boundary walls triggering silent or acoustic alarms upon breach."
        },
        {
          label: "Strobe & Siren Deterrence",
          desc: "Automated high-decibel sirens and flashing LED strobes that activate instantly when perimeter zones are violated."
        },
        {
          label: "Mobile Instant Push Notifications",
          desc: "Immediate smartphone notifications with attached snapshot preview sent directly to property managers."
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

      <WhatsAppFloatingButton defaultService="Physical Security & CCTV" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Commercial Surveillance &amp; Intrusion Defense</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Physical Security &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Surveillance Solutions
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Protect your business premises, staff, and assets with enterprise-grade IP CCTV camera networks, local RAID storage arrays, AI perimeter analytics, and low-light ColorVu imaging across Goa.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Request a Security Assessment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-8 text-sm h-12">
                <Link href="#services-grid">Explore CCTV Capabilities &darr;</Link>
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
              Security Pain Points
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">
              What Surveillance Problems We Solve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              Eliminate blurry analog video feeds, missing recording dates, and corrosion damage.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">01 / Clarity</div>
              <h3 className="text-lg font-bold text-white font-tech">Grainy Night Video &amp; Dark Spots</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Standard IR cameras produce washed-out faces or total darkness. We deploy ColorVu low-light lenses that preserve true color forensic details 24/7.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">02 / Reliability</div>
              <h3 className="text-lg font-bold text-white font-tech">Drive Crashes &amp; Overwritten Footage</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Single-drive DVRs fail silently, losing critical footage. We engineer RAID-configured NVRs with surveillance-grade drives that alert staff before disks fail.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-3">
              <div className="text-blue-400 font-mono font-bold text-sm">03 / Weather</div>
              <h3 className="text-lg font-bold text-white font-tech">Monsoon Water Ingress &amp; Lightning</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Coastal humidity and monsoon surges destroy unshielded lines. We install IP67 die-cast metal housings, sealed junction boxes, and Ethernet SPDs.
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Core Physical Security Offerings</h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base font-light">
              High-definition IP cameras, secure local storage arrays, and intelligent video analytics engineered for commercial reliability.
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
              Frequently Asked Questions: CCTV &amp; Physical Security
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Request CCTV Security Survey</h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Submit your property requirements below. Your enquiry is securely routed to our enterprise solutions team.
            </p>
          </div>
          <TechnologyAssessmentFunnel defaultService="physical-security" sourceContext="service_physical_security" />
        </div>
      </section>
    </div>
  );
}
