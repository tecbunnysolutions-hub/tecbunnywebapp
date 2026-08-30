import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Server, 
  Wifi, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Business IT & Network Infrastructure Planning Guide | TecBunny',
    description: 'Engineering guide for business owners and property managers planning structured cabling, dual-ISP failover, and enterprise Wi-Fi in Goa.',
    keywords: [
      'IT infrastructure planning guide',
      'office network checklist Goa',
      'structured cabling Cat6 fiber',
      'business Wi-Fi planning',
      'TecBunny guide'
    ],
    path: '/resources/infrastructure-planning-guide',
    image: BRAND_LOGO_URL,
  });
}

export default function InfrastructurePlanningGuidePage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultContext="Infrastructure Planning Guide" />

      {/* Header */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-4">
            <Link href="/resources" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono">
              <ArrowLeft size={14} /> Back to Resources
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold text-blue-400">
              <span>Engineering Framework</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-tech leading-tight">
              Business IT &amp; Network Infrastructure Planning Guide
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              A comprehensive checklist for business owners, hotel directors, and architects planning new facility construction or enterprise network modernization.
            </p>
          </div>
        </div>
      </section>

      {/* Main Guide Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          {/* Section 1 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">1. Physical Layer: Structured Cabling Architecture</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              The physical cabling is the most permanent asset in your building. Retrofitting cables after drywall and plastering costs 3x to 5x more than doing it correctly at the rough-in stage.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cat6 vs Cat6A:</strong> Use standard pure copper Cat6 (up to 1 Gbps at 100m) for office drops, and Cat6A (10 Gbps) or multi-mode OM3/OM4 fiber for server rack uplinks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Avoid Copper-Clad Aluminum (CCA):</strong> Cheap CCA cables break easily during pulling, suffer high resistance, and fail PoE power delivery standards. Always specify 100% solid bare copper.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Patch Panel Port Mapping:</strong> Every drop must terminate in a numbered patch panel with matching labels at the wall faceplate for fast maintenance.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">2. Gateway &amp; WAN Redundancy (Dual-ISP)</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              In regions like Goa where single-provider fiber cuts can happen during roadwork, dual-ISP auto-failover is essential for business continuity.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-WAN Router:</strong> Connect Primary Fiber (e.g. Airtel/Local Fiber) and Secondary Backup (e.g. BSNL/Jio/LTE) to a multi-WAN hardware router.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Sub-Second Health Probing:</strong> Configure gateway ping checks that route active traffic away from failing connections before user video calls drop.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">3. High-Density Wi-Fi 6 Layout &amp; VLANs</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              Consumer routers cannot handle 30+ simultaneous laptops and phones. Enterprise Wi-Fi requires centralized controller management.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>VLAN Segmentation:</strong> Separate Staff PCs, POS Billing Terminals, IP Security Cameras, and Guest Wi-Fi into isolated logical subnets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Power over Ethernet (PoE):</strong> Use managed PoE+ switches (802.3at) to power all access points directly through network cables without wall adapters.</span>
              </li>
            </ul>
          </div>

          {/* Commercial CTA Block */}
          <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8 sm:p-10 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 font-mono">Expert Assistance</span>
            <h3 className="text-2xl font-bold text-white font-tech">Need Help Designing Your Infrastructure?</h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
              Our certified network architects can survey your property, generate a complete Bill of Materials (BOM), and handle full deployment.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Get a Free Infrastructure Assessment</Link>
              </Button>
            </div>
          </div>

          {/* Embedded Assessment Funnel */}
          <div id="assessment-funnel" className="pt-8">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <h3 className="text-2xl font-bold text-white font-tech">Request Your Network Infrastructure Survey</h3>
              <p className="text-xs text-zinc-400">Complete the form below to receive a custom engineering proposal.</p>
            </div>
            <TechnologyAssessmentFunnel defaultService="network-infrastructure" sourceContext="guide_infrastructure" />
          </div>
        </div>
      </section>

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Business IT & Network Infrastructure Planning Guide',
            description: 'Engineering guide for structured cabling, dual-ISP failover, and high-density Wi-Fi deployment.',
            author: {
              '@type': 'Organization',
              name: 'TecBunny Solutions Pvt Ltd',
              url: 'https://www.tecbunny.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'TecBunny Solutions Pvt Ltd',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.tecbunny.com/brand.png',
              },
            },
            datePublished: '2026-01-15T00:00:00+05:30',
            dateModified: new Date().toISOString(),
          }),
        }}
      />
    </div>
  );
}
