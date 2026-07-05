import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Wifi, 
  Camera, 
  Lock, 
  Layers, 
  Server, 
  Activity, 
  FlameKindling,
  Workflow
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Client Case Studies & Project Portfolio | TecBunny Solutions',
    description: 'Explore our uncopyable proof of competence: verified tech portfolios detailing enterprise network setups, CCTV perimeters, and smart automation across Goa.',
    keywords: [
      'TecBunny portfolio',
      'Goa IT case studies',
      'custom networking Anjuna',
      'CCTV installation Parra',
      'biometric access Panaji',
      'smart home setups Pernem'
    ],
    path: '/portfolio',
    image: '/brand.png',
  });
}

interface ProjectCaseStudy {
  title: string;
  location: string;
  category: 'Networking' | 'Surveillance' | 'Access Control';
  badge: string;
  icon: any;
  before: string;
  challenges: string[];
  blueprint: {
    item: string;
    qty: string;
  }[];
  results: string;
}

export default function PortfolioPage() {
  const caseStudies: ProjectCaseStudy[] = [
    {
      title: "6-Node Mesh Network Installation for a Villa",
      location: "Anjuna, North Goa",
      category: "Networking",
      badge: "High-End Residential Wifi",
      icon: Wifi,
      before: "A luxury 3-story heritage villa struggled with dead zones and constant dropouts. The 18-inch thick Portuguese-style laterite stone walls blocked standard ISP router signals entirely, leaving 90% of the bedrooms and pool deck without coverage.",
      challenges: [
        "Routing structural ethernet lines without compromising the architectural heritage wood and plaster carvings.",
        "Drilling heavy laterite stone walls safely without causing structural cracks.",
        "Monsoon humidity protection for outdoor pool access points."
      ],
      blueprint: [
        { item: "Digisol Wi-Fi 6 Access Points", qty: "6 units" },
        { item: "Digisol Cloud-Managed Gateway", qty: "1 unit" },
        { item: "Digisol Lite 8-Port PoE Switch", qty: "1 unit" },
        { item: "Finolex Cat6 FTP Shielded Weatherproof Cable", qty: "150 meters" }
      ],
      results: "Implemented a fully managed Digisol subnet. Handoff latency is verified at sub-50ms (seamless roaming), with a steady 450+ Mbps download speed sustained across all indoor areas and the poolside garden."
    },
    {
      title: "8-Camera Enterprise IP CCTV Surveillance Setup",
      location: "Parra, North Goa",
      category: "Surveillance",
      badge: "Commercial Perimeter Security",
      icon: Camera,
      before: "A private estate suffered from blind spots along its perimeter fencing, leading to minor trespassing incidents. The old analog cameras lacked night-vision capture and frequently lost their feeds due to local power surges.",
      challenges: [
        "Running long outdoor cable runs (up to 95 meters) prone to lightning induction and noise.",
        "Achieving identification-grade resolution at night on poorly illuminated entry points.",
        "Protecting NVR storage against Goa's frequent electrical grid fluctuations."
      ],
      blueprint: [
        { item: "Hikvision 4MP ColorVu PoE Bullet Cameras", qty: "8 units" },
        { item: "Hikvision 8-Channel NVR (4TB SkyHawk HDD)", qty: "1 unit" },
        { item: "TP-Link 8-Port Gigabit PoE+ Managed Switch", qty: "1 unit" },
        { item: "APC 1KVA Line-Interactive Online UPS", qty: "1 unit" },
        { item: "Surge Protection Devices (SPD) on all lines", qty: "8 units" }
      ],
      results: "Full 24/7 color coverage is archived locally and backed up dynamically to cloud storage. Surges are mitigated by SPDs and online UPS, keeping cameras 100% active during utility blackouts."
    },
    {
      title: "Smart Biometric Access Control for Coworking Hub",
      location: "Panaji, Goa",
      category: "Access Control",
      badge: "Workspace Identity Management",
      icon: Lock,
      before: "A shared office space with 80+ daily hot-desk members relied on manual logbooks. Physical keys were frequently copied or lost, creating a serious security breach liability and manual admin overhead.",
      challenges: [
        "Integrating high daily transit capacity with fast, fail-safe unlock triggers.",
        "Mounting heavy locks on custom structural glass doors without frame drill options.",
        "Ensuring immediate emergency release compliance linked to the central fire panel."
      ],
      blueprint: [
        { item: "Essl X990 Biometric Fingerprint & RFID Controller", qty: "2 units" },
        { item: "Fail-Safe Magnetic Locks (600 lbs holding force)", qty: "2 units" },
        { item: "U-Bracket Mounts for Toughened Glass Doors", qty: "2 units" },
        { item: "Encrypted 13.56MHz MIFARE Smart Cards", qty: "100 units" },
        { item: "Central Control Access Management Server", qty: "1 unit" }
      ],
      results: "biometric registration takes under 1.5 seconds. Reception entry queues dropped by 85%. The local server automatically logs check-ins and disengages magnetic locks instantly on fire alarm panel triggers."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden py-16 sm:py-24">
      {/* Background Grids */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 sm:px-8">
        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Proof of Capability</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-tech leading-tight text-white">
            Our Deployment <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">Portfolio</span>
          </h1>
          <p className="text-base font-light leading-relaxed text-zinc-400">
            We don't expect you to take our word for it. Here is the uncopyable, documented evidence of custom IT and physical infrastructures we have designed and built across Goa.
          </p>
        </section>

        {/* Case Studies Display */}
        <section className="space-y-12">
          {caseStudies.map((project, idx) => {
            const IconComponent = project.icon;
            return (
              <div 
                key={idx} 
                className="bento-card p-8 bg-zinc-950/60 border border-zinc-900 rounded-3xl hover:border-zinc-800 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative overflow-hidden group"
              >
                {/* Background Ambient Glow */}
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-2xl pointer-events-none transition-all duration-300 group-hover:scale-125" />

                {/* Left Column: Project Overview */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      <IconComponent className="h-3.5 w-3.5" />
                      {project.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-650" />
                      {project.location}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold font-tech text-white leading-tight">
                    {project.title}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-rose-500" />
                        The Dilemma (Before)
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-light">
                        {project.before}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Workflow className="h-3.5 w-3.5 text-amber-500" />
                        Structural & Environmental Challenges
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-400 font-light">
                        {project.challenges.map((challenge, cIdx) => (
                          <li key={cIdx} className="flex gap-2.5">
                            <span className="text-amber-500 font-bold shrink-0">&middot;</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hardware Blueprint & Results */}
                <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-zinc-900 lg:pl-8 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-3 flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-blue-500" />
                      Hardware Blueprint (BOM)
                    </h4>
                    <div className="divide-y divide-zinc-900 border-y border-zinc-900 py-1.5">
                      {project.blueprint.map((bp, bpIdx) => (
                        <div key={bpIdx} className="flex justify-between text-xs py-2">
                          <span className="text-zinc-400 font-light">{bp.item}</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-bold shrink-0">{bp.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 mt-auto">
                    <h4 className="text-[10px] uppercase font-bold text-blue-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Verified Results
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed font-light">
                      {project.results}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA Footer */}
        <section className="tb-panel relative overflow-hidden p-8 rounded-3xl border border-zinc-900 bg-zinc-950/20 text-center space-y-5 max-w-3xl mx-auto w-full mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/5 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <FlameKindling className="h-3.5 w-3.5" /> Ready to build?
          </span>
          <h2 className="text-2xl font-bold font-tech text-white leading-snug">Need a Custom Technical Setup for Your Premises?</h2>
          <p className="text-xs text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Whether it's an office network migration, estate perimeter security design, or private cinema build in Goa, our engineering team is ready to survey and configure your space.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-sm">
              <Link href="/customised-setups">Configure Custom Setup</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl px-8">
              <Link href="/contact">Book On-Site Survey</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
