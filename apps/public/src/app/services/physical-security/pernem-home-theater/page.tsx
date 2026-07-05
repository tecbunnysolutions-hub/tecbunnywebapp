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
  Music,
  Tv,
  MapPin,
  HeartHandshake
} from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { createPageMetadata } from "@tecbunny/core/metadata";
import { InfrastructureLeadForm } from '@/components/InfrastructureLeadForm';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Premium Home Theater & Smart Automation Pernem | TecBunny Solutions',
    description: 'Bespoke home theater installations, premium multi-room audio acoustics, and smart lighting controls for luxury residences and villas in Pernem, Parcem, and Mandrem.',
    keywords: [
      'Home theater installation Pernem',
      'smart home automation Mandrem',
      'acoustic treatment Goa',
      'custom sound systems Pernem',
      'villa automation Goa',
      'luxury home theater Parcem',
      'TecBunny Solutions'
    ],
    path: '/services/physical-security/pernem-home-theater',
    image: '/brand.png',
  });
}

export default function PernemHomeTheaterPage() {
  const localTargetAreas = [
    { name: "Pernem & Parcem", desc: "Bespoke media room design, customized acoustic panelling, and integrated smart control systems right at our doorstep." },
    { name: "Mandrem & Arambol", desc: "Premium outdoor multi-zone speaker grids and smart ambient lighting installations for seaside villas." },
    { name: "Morjim & Ashvem", desc: "High-end multi-room audio setups, motorized projector screen lifts, and smart climate integration." },
    { name: "Siolim & Mapusa", desc: "Whole-home Wi-Fi automation controllers and private cinema setups for luxury apartments." }
  ];

  const subServices = [
    {
      title: "Bespoke Private Cinemas",
      subtitle: "Custom-calculated seating plans, room acoustics, and high-definition laser projectors.",
      icon: Tv,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/35",
      points: [
        {
          label: "Laser Projection & UHD",
          desc: "Ultra-short-throw or ceiling-mounted 4K HDR laser projectors rendering crystal clear cinema views."
        },
        {
          label: "Acoustic Wall Paneling",
          desc: "Custom fabric-wrapped panels absorbing sound waves to deliver deep, clean bass without rattling local structures."
        },
        {
          label: "Motorized Seating Grids",
          desc: "Ergonomic leather recliners with integrated sub-bass shakers that vibrate in sync with low-frequency cinematic effects."
        }
      ]
    },
    {
      title: "Smart Home Integration",
      subtitle: "Unified Control4/Home Assistant configurations managing audio, visual, lighting, and security.",
      icon: Shield,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/35",
      points: [
        {
          label: "Scene-Based Controls",
          desc: "Tap a single button to dim the lights, roll down motorized shades, and power up the sound system automatically."
        },
        {
          label: "Multi-Room Audio Matrix",
          desc: "Play separate playlists in the garden pool, kitchen, and private lounge from a centralized media server."
        },
        {
          label: "Invisible Architectural Speakers",
          desc: "Premium in-wall and in-ceiling speakers that blend into plaster finishes, delivering high-fidelity audio with zero footprint."
        }
      ]
    }
  ];

  const benefits = [
    {
      title: "Direct Local Support & Surveying",
      desc: "Our headquarters are based in Parse, Pernem. We offer fast physical surveys and hands-on calibration/maintenance calls for local residences."
    },
    {
      title: "High-Trust Corporate Backing",
      desc: "Unlike freelance technicians, we are a registered Private Limited company providing detailed warranties, GST invoicing, and structural accountability."
    },
    {
      title: "Seamless Network Architecture",
      desc: "Every automation system is backed by our signature enterprise networking setups, guaranteeing zero-latency media streaming."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-purple-500/20 selection:text-white overflow-hidden pt-0 pb-16 sm:pt-0 sm:pb-24">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-purple-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-pink-500/5 blur-[180px]" />
      </div>

      <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] animate-pulse" aria-hidden="true" />
      <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4.5 py-1.5 text-sm font-semibold text-purple-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Premium Custom Integration</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-tech leading-tight">
              Home Theater & Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-200 to-white">
                Automation in Pernem
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We design, install, and calibrate world-class private cinemas and smart villa controls. Elevate your Pernem residence with high-fidelity acoustics.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-8 shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)] transition-all">
                <Link href="#lead-form-section">Book On-Site Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Grid */}
      <section className="py-16 md:py-24 border-b border-zinc-900/50">
        <div className="container mx-auto px-6 max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.45em] text-purple-500 font-bold">Local Experience</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Tailored for Luxury Villas in Pernem</h2>
            <p className="mt-4 text-zinc-400 font-light text-sm">
              We craft luxury acoustics and intuitive automation systems to fit the architecture of premium villas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {localTargetAreas.map((area, index) => (
              <div key={index} className="flex flex-col rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4">
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
            <span className="text-sm uppercase tracking-[0.45em] text-purple-500 font-bold">What We Deliver</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Acoustic & Integration Services</h2>
            <p className="mt-4 text-zinc-300 text-base font-light">
              High-end audiovisual configurations, motorized control layers, and clean smart-home execution.
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
                            <CheckCircle2 size={18} className="text-purple-500 shrink-0 mt-0.5" />
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
              <span className="text-sm uppercase tracking-[0.45em] text-purple-500 font-bold">Why TecBunny</span>
              <h2 className="text-3xl font-bold text-white font-tech leading-tight">
                Designed for Sound. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Built for Comfort.
                </span>
              </h2>
              <blockquote className="border-l-2 border-purple-500 pl-4 py-1.5 italic text-zinc-300 font-light text-sm leading-relaxed">
                &ldquo;A cinema room is only as good as its acoustics. We control structural vibration and optimize reverberation to replicate the theater experience.&rdquo;
              </blockquote>
              <p className="text-zinc-300 text-sm font-light leading-relaxed">
                We combine sound science with premium brands (Dali, Klipsch, Denon, Control4) to craft custom entertainment sanctuaries.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-6">
              {benefits.map((adv, idx) => (
                <div key={idx} className="flex gap-6 rounded-2xl border border-zinc-900 bg-[#09090B] p-6 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <HeartHandshake size={20} />
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
            <span className="text-sm uppercase tracking-[0.45em] text-purple-500 font-bold">Request an Estimate</span>
            <h2 className="mt-3 text-3xl font-bold text-white font-tech tracking-tight">Request Acoustic Survey</h2>
            <p className="mt-4 text-zinc-300 font-light text-sm">
              Provide your details below. A certified smart home systems consultant will connect with you to review blueprints or plan a room walkthrough.
            </p>
          </div>
          <InfrastructureLeadForm />
        </div>
      </section>
    </div>
  );
}
