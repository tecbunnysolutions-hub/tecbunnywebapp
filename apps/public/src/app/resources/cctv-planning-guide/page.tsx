import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Camera, 
  Shield, 
  HardDrive, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Commercial CCTV & IP Surveillance Engineering Guide | TecBunny',
    description: 'How to plan commercial CCTV, eliminate blind spots, calculate NVR storage, and protect against coastal humidity in Goa.',
    keywords: [
      'commercial CCTV planning guide',
      'NVR storage calculation',
      'IP CCTV installation Goa',
      'ColorVu low light surveillance',
      'TecBunny guide'
    ],
    path: '/resources/cctv-planning-guide',
    image: BRAND_LOGO_URL,
  });
}

export default function CCTVPlanningGuidePage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <WhatsAppFloatingButton defaultContext="CCTV Planning Guide" />

      {/* Header */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-4">
            <Link href="/resources" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono">
              <ArrowLeft size={14} /> Back to Resources
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold text-blue-400">
              <span>Security Engineering Framework</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-tech leading-tight">
              Commercial CCTV &amp; IP Surveillance Engineering Guide
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              How to architect high-reliability surveillance systems that prevent blind spots, withstand tropical humidity, and deliver actionable forensic video evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          {/* Section 1 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">1. IP vs. Older Analog (HD-TVI/AHD) CCTV</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              For commercial facilities, IP-based surveillance is the modern standard over coaxial analog wiring due to cable distance limits, resolution scaling, and AI intelligence.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Single Cable PoE:</strong> IP cameras receive both electrical power and gigabit data over a single Cat6 line, cutting electrical labor costs by 50%.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Edge AI Detection:</strong> IP cameras process line-crossing, license plate reading, and human/vehicle filtering directly on the sensor, eliminating false leaf/shadow motion alarms.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">2. Calculating NVR Storage &amp; Codecs (H.265+)</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              Standard commercial compliance often requires 30 to 90 days of continuous recording. Calculating drive capacity prevents unexpected storage overflows.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>H.265+ Compression:</strong> Modern H.265+ compression reduces storage bandwidth by up to 70% compared to legacy H.264 without reducing pixel clarity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Surveillance-Grade Hard Drives:</strong> Never use desktop HDDs in an NVR. Always specify 24/7 continuous-write surveillance drives (e.g. WD Purple, Seagate SkyHawk) in RAID 5/1 configurations.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-950/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white font-tech">3. Weatherproofing &amp; Surge Protection in Coastal Goa</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              Coastal salinity and monsoon thunderstorms are the primary causes of camera failure in Goa.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>IP67 Rated Housing:</strong> Ensure outdoor cameras carry verified IP67 ingress protection and die-cast aluminum enclosures rather than brittle plastic.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dedicated Ethernet Surge Arrestors (SPDs):</strong> Outdoor poles and perimeter walls act as lightning conductors. Installing SPDs on every external line prevents high-voltage spikes from destroying the NVR.</span>
              </li>
            </ul>
          </div>

          {/* Commercial CTA Block */}
          <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8 sm:p-10 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 font-mono">Expert Security Survey</span>
            <h3 className="text-2xl font-bold text-white font-tech">Planning a CCTV Installation or Upgrade?</h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
              Our security specialists evaluate your floorplan, map camera angles to eliminate blind spots, and provide a transparent quotation.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-12 text-sm shadow-lg shadow-blue-500/20">
                <Link href="#assessment-funnel">Request a Free Security Assessment</Link>
              </Button>
            </div>
          </div>

          {/* Embedded Assessment Funnel */}
          <div id="assessment-funnel" className="pt-8">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <h3 className="text-2xl font-bold text-white font-tech">Request Your CCTV Security Survey</h3>
              <p className="text-xs text-zinc-400">Complete the form below to receive a custom security layout proposal.</p>
            </div>
            <TechnologyAssessmentFunnel defaultService="physical-security" sourceContext="guide_cctv" />
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
            headline: 'Commercial CCTV & IP Surveillance Engineering Guide',
            description: 'How to plan commercial CCTV, eliminate blind spots, and calculate NVR storage.',
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
            datePublished: '2026-01-20T00:00:00+05:30',
            dateModified: new Date().toISOString(),
          }),
        }}
      />
    </div>
  );
}
