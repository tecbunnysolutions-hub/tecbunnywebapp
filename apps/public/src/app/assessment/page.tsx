import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BRAND_LOGO_URL } from '@tecbunny/ui';
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { TrustSection } from '@/components/TrustSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Free Technology Assessment & Site Survey | TecBunny Solutions',
    description: 'Request a free, comprehensive technology infrastructure and security assessment for your business in Goa. Tailored for hotels, offices, healthcare, and enterprises.',
    keywords: [
      'technology assessment Goa',
      'CCTV site survey Goa',
      'network audit Goa',
      'hotel technology survey',
      'office IT assessment',
      'smart infrastructure consultation',
      'TecBunny Solutions'
    ],
    path: '/assessment',
    image: BRAND_LOGO_URL,
  });
}

export default function AssessmentPage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden pb-20">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-blue-500/10 blur-[170px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[190px]" />
      </div>

      <WhatsAppFloatingButton defaultContext="Free Technology Assessment" />

      {/* Hero Header */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 border-b border-zinc-900">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Complimentary Site Survey & Proposal</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-tech leading-tight text-white">
              Get Your Free <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Technology Assessment
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light leading-relaxed text-zinc-300 max-w-2xl mx-auto">
              Tell us about your organization and infrastructure requirements. Our certified systems architects will review your specifications, deliver a custom blueprint, and arrange an on-site physical survey.
            </p>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Zero Obligation Proposal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Same Business Day Response</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Goa-Wide Coverage</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Funnel Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <TechnologyAssessmentFunnel sourceContext="assessment_landing_page" />
        </div>
      </section>

      {/* Trust & Process Components */}
      <HowItWorksSection 
        title="What Happens After You Submit?" 
        subtitle="Our transparent 8-step deployment process ensures you understand every stage before committing capital."
      />

      <TrustSection />

      {/* Structured Data for the Assessment Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Free Technology Assessment & Site Survey',
            provider: {
              '@type': 'Organization',
              name: 'TecBunny Solutions Pvt Ltd',
              url: 'https://www.tecbunny.com',
              telephone: '+919604136010',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Pernem',
                addressRegion: 'Goa',
                postalCode: '403512',
                addressCountry: 'IN',
              },
            },
            serviceType: 'Technology Infrastructure Assessment',
            areaServed: {
              '@type': 'State',
              name: 'Goa',
            },
            description: 'Free technical site survey and assessment for corporate networks, CCTV surveillance, RFID access control, and smart building infrastructure.',
          }),
        }}
      />
    </div>
  );
}
