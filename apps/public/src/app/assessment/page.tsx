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

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string; industry?: string; context?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
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
              Tell us about your organization and infrastructure requirements. Our systems architects will review your specifications, deliver a custom blueprint, and arrange an on-site physical survey.
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
          <TechnologyAssessmentFunnel 
            defaultService={resolvedParams.service}
            defaultIndustry={resolvedParams.industry}
            sourceContext={resolvedParams.context || 'assessment_landing_page'} 
          />
        </div>
      </section>

      {/* Post-submit process — compact variant keeps the form as the star of this page */}
      <HowItWorksSection
        variant="compact"
        title="What Happens Next?"
        subtitle="Three clear stages from submission to a scoped proposal."
      />

      {/* Slim trust strip — full trust details live on /industries and /about */}
      <section className="py-8 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-400">
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-400" />
              Registered Indian enterprise with GST invoicing
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-400" />
              Experienced field engineers across Goa
            </li>
            <li className="flex items-center gap-2">
              <Building2 size={14} className="text-blue-400" />
              Genuine Tier-1 OEM hardware
            </li>
          </ul>
        </div>
      </section>

      {/* Short FAQ — deep answers live on /info/faqs */}
      <section className="py-10 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl font-bold text-white font-tech mb-6">Common Questions</h2>
          <dl className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <dt className="text-sm font-semibold text-white">Is the assessment really free?</dt>
              <dd className="mt-1 text-sm text-zinc-400 font-light leading-relaxed">
                Yes. The site survey, blueprint review, and itemized proposal carry no charge and no obligation.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <dt className="text-sm font-semibold text-white">How quickly will I hear back?</dt>
              <dd className="mt-1 text-sm text-zinc-400 font-light leading-relaxed">
                Our engineering team responds the same business day and schedules the on-site survey within 48 hours across Goa.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <dt className="text-sm font-semibold text-white">What do you need from me?</dt>
              <dd className="mt-1 text-sm text-zinc-400 font-light leading-relaxed">
                Just your business type, property size, and current pain points — the form guides you through the rest in under two minutes.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950 p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-tech">Prefer to talk it through first?</h2>
            <p className="mt-2 text-sm text-zinc-400 font-light">Speak directly with an engineer about your site before committing to a survey.</p>
            <Link
              href="/contact?subject=sales&intent=enterprise_consultation&source=assessment_footer"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors"
            >
              Talk to an Engineer
            </Link>
          </div>
        </div>
      </section>

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
