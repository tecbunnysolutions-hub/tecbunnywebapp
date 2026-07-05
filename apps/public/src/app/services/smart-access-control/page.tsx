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
  Smartphone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/metadata';
import { InfrastructureLeadForm } from '@/components/InfrastructureLeadForm';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Smart Access Control Systems | TecBunny Solutions',
    description: 'Next-gen biometric entry, facial recognition systems, RFID lock integrations, speed gates, turnstiles, and automated barrier gate controllers.',
    keywords: [
      'smart access control',
      'biometric entry',
      'facial recognition',
      'RFID hotel locks',
      'turnstiles',
      'barrier gates',
      'facility security',
      'TecBunny'
    ],
    path: '/services/smart-access-control',
    image: '/brand.png',
  });
}

export default function SmartAccessControlPage() {
  const subServices = [
    {
      title: "Biometric & Facial Recognition",
      subtitle: "Secure entryways using absolute biological verification algorithms.",
      icon: Fingerprint,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      border: "hover:border-blue-500/35",
      points: [
        {
          label: "0.2s Facial Recognition",
          desc: "High-speed optical scanners matching user profiles and granting access in milliseconds under any lighting."
        },
        {
          label: "Multi-Spectral Fingerprint Sensors",
          desc: "Sub-dermal scanning technology preventing fingerprint spoofing or bypass via artificial mold duplicates."
        },
        {
          label: "Anti-Spoofing Liveness Checks",
          desc: "Active depth-sensing cameras preventing bypass using photos or digital displays."
        }
      ]
    },
    {
      title: "RFID & Contactless Lock Systems",
      subtitle: "Enterprise-wide smart cards and credentials engineered for offices & hospitality.",
      icon: Lock,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Encrypted Mifare RFID Cards",
          desc: "Contactless cards carrying high-grade encryption to prevent credential sniffing or card cloning."
        },
        {
          label: "Central Key Management",
          desc: "Instantly issue, track, or revoke area credentials using central administration consoles."
        },
        {
          label: "BLE Smartphone Integration",
          desc: "Allow staff and guests to unlock secure doors using encrypted Bluetooth tokens on their mobile apps."
        }
      ]
    },
    {
      title: "Pedestrian Speed Gates & Turnstiles",
      subtitle: "Robust physical barrier structures managing high-volume facility lanes.",
      icon: Key,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Optical Swing Speed Gates",
          desc: "Sleek, transparent glass barriers with built-in sensors detecting tailgating or unauthorized entry."
        },
        {
          label: "Tripod & Full-Height Turnstiles",
          desc: "Heavy-duty steel turnstiles for perimeter boundaries, ensuring strict one-by-one transit verification."
        },
        {
          label: "Fire Alarm Safe Integration",
          desc: "Automatic drop-arm or gate-open fail-safes linked to fire warning consoles for emergency evacuations."
        }
      ]
    },
    {
      title: "Vehicle Barrier Gates & ANPR",
      subtitle: "Automated perimeter gate control managing corporate and property driveways.",
      icon: Smartphone,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      border: "hover:border-amber-500/35",
      points: [
        {
          label: "Automatic License Plate Readers (ANPR)",
          desc: "Open boom barriers instantly for registered transport fleets or white-listed employee vehicles."
        },
        {
          label: "High-Speed Boom Barriers",
          desc: "Heavy-duty electric barrier gates built for continuous duty and equipped with safety loop sensors."
        },
        {
          label: "Long-Range UHF Readers",
          desc: "Passive windshield tag detection triggering barrier gate openings from up to 8 meters away."
        }
      ]
    }
  ];

  const advantages = [
    {
      title: "Complete Access Auditing",
      desc: "Maintain precise records of employee check-ins, guest visits, and secure server room entry."
    },
    {
      title: "Integration With HRMS & PMS",
      desc: "Auto-sync check-in data with attendance, payroll, or hotel property management systems."
    },
    {
      title: "Instant Remote Lockdown",
      desc: "Emergency trigger systems allowing administrators to lock down or unlock all gates with one command."
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
              <span>Contactless Physical Access</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-tech leading-tight">
              Smart Access Control <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Systems
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We design, install, and support next-gen biometric entries, facial recognition systems, RFID credentials, pedestrian speed gates, and automated barrier controllers.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl px-8 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] transition-all">
                <Link href="#lead-form-section">Request A Quote</Link>
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Our Access Control Solutions</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              Advanced facility gating systems securing entry points while providing friction-free access to authenticated employees and guests.
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
                Designed for Control. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Built for Speed.
                </span>
              </h2>
              <blockquote className="border-l-2 border-blue-500 pl-4 py-1.5 italic text-zinc-300 font-light text-base leading-relaxed">
                &ldquo;Modern facilities require smart access credentials. Traditional keys are a security liability.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-base font-light leading-relaxed">
                We integrate credential databases with secure on-premise hardware, giving you full control over access rules, schedules, and active logs from any authorized terminal.
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white font-tech tracking-tight">Request Access Control Proposal</h2>
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
