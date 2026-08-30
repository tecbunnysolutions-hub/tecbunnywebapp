import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Server, 
  Camera, 
  Lock, 
  Wifi,
  Download
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { TrustSection } from '@/components/TrustSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Resources & Technology Planning Guides | TecBunny',
    description: 'Technical checklists, planning guides, and architectural frameworks for enterprise IT infrastructure, CCTV surveillance, and access control in Goa.',
    keywords: [
      'IT infrastructure planning guide',
      'CCTV planning checklist Goa',
      'hotel Wi-Fi engineering guide',
      'office network checklist',
      'TecBunny resources'
    ],
    path: '/resources',
    image: BRAND_LOGO_URL,
  });
}

const RESOURCES = [
  {
    slug: 'infrastructure-planning-guide',
    title: 'Business IT & Network Infrastructure Planning Guide',
    desc: 'A comprehensive engineering guide for business owners, hotel managers, and architects planning new builds or network overhauls.',
    category: 'Networking & Infrastructure',
    readTime: '8 min read',
    icon: Server,
    highlights: ['Structured Cabling Best Practices', 'Bandwidth & Access Point Density Calculations', 'Dual-ISP Redundancy Setup', 'Server Rack & Cooling Standards']
  },
  {
    slug: 'cctv-planning-guide',
    title: 'Commercial CCTV & IP Surveillance Engineering Guide',
    desc: 'How to plan camera coverage, eliminate blind spots, calculate NVR storage requirements, and protect against coastal humidity in Goa.',
    category: 'Physical Security',
    readTime: '7 min read',
    icon: Camera,
    highlights: ['IP vs Analog Camera Trade-offs', 'NVR Storage RAID Sizing Formula', 'Low-Light & Perimeter AI Detection', 'Surge & Weatherproofing Checklist']
  }
];

export default function ResourcesIndexPage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultContext="Technical Resources" />

      {/* Header Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-semibold text-blue-400">
              <FileText size={14} />
              <span>Technical Knowledge & Frameworks</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-tech leading-tight text-white">
              Technology Resources & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Planning Guides
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light leading-relaxed text-zinc-300 max-w-2xl mx-auto">
              Practical, engineering-grade frameworks designed to help property developers, facility managers, and enterprise directors plan reliable technology infrastructure.
            </p>

            <div className="pt-3">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="/assessment">Request Free Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {RESOURCES.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.slug}
                  className="rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:bg-zinc-900/20 group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-mono text-zinc-500">
                        {res.readTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 font-mono">
                        {res.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-tech mt-1 leading-snug">
                        {res.title}
                      </h2>
                      <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                        {res.desc}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-zinc-900 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Key Topics Covered:</span>
                      <ul className="grid grid-cols-1 gap-1.5 text-xs text-zinc-300">
                        {res.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-900">
                    <Button asChild className="w-full bg-zinc-900 hover:bg-blue-600 hover:text-white text-zinc-200 border border-zinc-800 rounded-xl h-11 text-xs font-bold uppercase tracking-wider transition-colors">
                      <Link href={`/resources/${res.slug}`}>
                        Read Complete Guide &rarr;
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TrustSection />
    </div>
  );
}
