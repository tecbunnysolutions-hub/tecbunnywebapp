import Link from 'next/link';
import type { Metadata } from 'next';

import { Building2, FileText, Headphones, Network, ShieldCheck, Wrench } from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { QuoteCTA } from '@/components/customised-setups/QuoteCTA';
import { QuotationStatusLookup } from '@/components/customised-setups/QuotationStatusLookup';
import CustomSetupFlow from '@/components/customised-setups/ClientCustomSetupFlow';
import { DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG } from "@tecbunny/core/custom-setup.constants";
import { getCustomSetupBlueprintSummary } from "@tecbunny/core/custom-setup-service";

import { createPageMetadata } from "@tecbunny/core/metadata";
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'Build Your Custom CCTV Setup | TecBunny',
  description: 'Plan a custom CCTV setup with recommended equipment, installation options, and a TecBunny quote.',
  path: '/customised-setups',
  keywords: ['custom CCTV setup', 'CCTV estimator', 'CCTV installation Goa', 'security systems Goa'],
});
}

// export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force no caching

export default async function CustomisedSetupsPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const { refresh } = await searchParams;
  const refreshKey = refresh ?? 'default';
  let blueprint = null;
  try {
    blueprint = await getCustomSetupBlueprintSummary(DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG);
    // Debug log for blueprint fetch - can be removed in production

    //   success: !!blueprint,
    //   systemCount: blueprint?.systems?.length || 0,
    //   slug: DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG,
    //   timestamp: new Date().toISOString(),
    //   refreshParam: searchParams.refresh || 'none',
    //   samplePricing: blueprint?.systems?.[0]?.components?.[0]?.options?.[0] ? {
    //     label: blueprint.systems[0].components[0].options[0].label,
    //     unitPrice: blueprint.systems[0].components[0].options[0].unitPrice,
    //     metadata: blueprint.systems[0].components[0].options[0].metadata
    //   } : null
    // });
  } catch (error) {
    // Log error for debugging - consider using proper logging service in production
    console.error('Failed to fetch blueprint for public page:', error);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Customised Setups', url: 'https://www.tecbunny.com/customised-setups' },
        ]}
      />
      <section className="tb-setup-hero relative overflow-hidden border-b border-border pt-24 pb-14 sm:pt-28 sm:pb-20">
        <div className="tb-setup-blueprint" aria-hidden="true"><Network /><span /><Building2 /><span /><ShieldCheck /><span /><FileText /></div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
            <ShieldCheck className="h-4 w-4" /> TecBunny setup planner
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Build your custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">CCTV setup.</span>
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tell us about your property, coverage needs, and budget. TecBunny will help you create the right CCTV setup with recommended equipment, pricing, and installation options.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-200">No technical knowledge required.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="#setup-planner">Start building my setup</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
              <Link href="/contact?intent=engineer_consultation&source=custom_setup_hero">Talk to an engineer</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/10 py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="tb-setup-process rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-sm font-semibold text-primary">01 · Tell us what you need</p>
            <p className="mt-2 text-sm text-muted-foreground">Choose your property type and the systems you want help with. “I don’t know” is always okay.</p>
          </div>
          <div className="tb-setup-process rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-sm font-semibold text-primary">02 · Customize your setup</p>
            <p className="mt-2 text-sm text-muted-foreground">Start simple, then refine equipment and installation options when you are ready.</p>
          </div>
          <div className="tb-setup-process rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-sm font-semibold text-primary">03 · Get your recommendation &amp; quote</p>
            <p className="mt-2 text-sm text-muted-foreground">Review your estimated setup, request a formal quote, or ask an engineer to verify it.</p>
          </div>
        </div>
      </section>

      <section id="setup-planner" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-6xl">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Setup Planner</p>
            <h2 className="text-3xl font-semibold text-foreground">Start with the essentials. We’ll handle the technical detail.</h2>
            <p className="text-muted-foreground">
              Your estimate is a helpful starting point, not a final engineering design. You can adjust technical equipment after you describe the basics.
            </p>
          </div>
        </div>
        <CustomSetupFlow key={refreshKey} blueprint={blueprint} variant="tech" />
      </section>

      <section className="border-t border-border bg-muted/10 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-3xl space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Quote Tools</p>
            <h2 className="text-2xl font-semibold text-foreground">Already have a quote?</h2>
            <p className="text-muted-foreground">Download a formal quote or check an existing quotation without interrupting your setup builder.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <QuoteCTA />
            <QuotationStatusLookup />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">What happens after you share this estimate?</h2>
            <p className="text-muted-foreground">A TecBunny engineer validates cable runs, storage retention, power plans, and installation requirements before finalizing your proposal.</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground">
                <Wrench className="h-4 w-4" /> Professional on-site specialists
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" /> Compliance-ready hardware choices
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="https://wa.me/919604136010" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
