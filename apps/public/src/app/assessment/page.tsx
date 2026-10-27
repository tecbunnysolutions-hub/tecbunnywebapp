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
import { BRAND_LOGO_URL } from "@tecbunny/core/brand";
import { TechnologyAssessmentFunnel } from '@/components/TechnologyAssessmentFunnel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

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
    <div className="relative min-h-screen bg-card text-muted-foreground selection:bg-primary/20 selection:text-primary overflow-hidden tb-page-bottom">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Free Technology Assessment', url: 'https://www.tecbunny.com/assessment' },
        ]}
      />
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[48rem] w-[48rem] rounded-full bg-primary/10 blur-[170px]" />
        <div className="absolute -right-40 top-1/4 h-[50rem] w-[50rem] rounded-full bg-primary/10 blur-[190px]" />
      </div>

      {/* Hero Header */}
      <section className="relative border-b border-border tb-page-top tb-page-bottom">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span>Complimentary Site Survey & Proposal</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-tech leading-tight text-foreground">
              Get Your Free <br />
              <span className=" text-primary">
                Technology Assessment
              </span>
            </h1>

            <p className="text-base sm:text-lg font-light leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Tell us about your organization and infrastructure requirements. Our systems architects will review your specifications, deliver a custom blueprint, and arrange an on-site physical survey.
            </p>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                <span>Zero Obligation Proposal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                <span>Same Business Day Response</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                <span>Goa-Wide Coverage</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Funnel Section */}
      <section className="tb-section-space">
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
      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              Registered Indian enterprise with GST invoicing
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              Local field engineers serving North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra
            </li>
            <li className="flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Genuine Tier-1 OEM hardware
            </li>
          </ul>
        </div>
      </section>

      {/* Short FAQ — deep answers live on /info/faqs */}
      <section className="py-10 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground font-tech mb-6">Common Questions</h2>
          <dl className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-5">
              <dt className="text-sm font-semibold text-foreground">Is the assessment really free?</dt>
              <dd className="mt-1 text-sm text-muted-foreground font-light leading-relaxed">
                Yes. The site survey, blueprint review, and itemized proposal carry no charge and no obligation.
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-5">
              <dt className="text-sm font-semibold text-foreground">How quickly will I hear back?</dt>
              <dd className="mt-1 text-sm text-muted-foreground font-light leading-relaxed">
                Our engineering team responds the same business day. On-site surveys are scheduled the same day within about 15 km of Parcem when you contact us in the first half of the day, the next business day up to about 35 km, and later for sites beyond that.
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-5">
              <dt className="text-sm font-semibold text-foreground">What do you need from me?</dt>
              <dd className="mt-1 text-sm text-muted-foreground font-light leading-relaxed">
                Just your business type, property size, and current pain points — the form guides you through the rest in under two minutes.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/40 via-background to-background p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-tech">Prefer to talk it through first?</h2>
            <p className="mt-2 text-sm text-muted-foreground font-light">Speak directly with an engineer about your site before committing to a survey.</p>
            <Link
              href="/contact?subject=sales&intent=enterprise_consultation&source=assessment_footer"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors"
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
