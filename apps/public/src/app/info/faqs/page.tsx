import { getApi } from '@/lib/api';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import FaqsClient from '@/components/FaqsClient';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { Skeleton } from "@tecbunny/ui";
import { createPageMetadata } from '@tecbunny/core/metadata';
import { stripHtmlToPlainText } from '@tecbunny/core/strings';

export const revalidate = 60; // Revalidate at most once every minute

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Frequently Asked Questions | TecBunny Solutions Goa',
    description: 'Answers about CCTV installation, IT services, AMC support, pricing, warranties, and service coverage in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    keywords: ['TecBunny FAQ', 'CCTV questions Goa', 'IT services FAQ', 'AMC support questions'],
    path: '/info/faqs',
  });
}

type FaqRow = {
  id: string;
  category: string | null;
  question: string;
  answer: string;
  display_order: number | null;
};

type DisplayFaq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
};

function normalizeFaqs(faqs: FaqRow[]): DisplayFaq[] {
  return faqs.map((faq) => ({
    ...faq,
    category: faq.category?.trim() || 'General',
    display_order: faq.display_order ?? 0,
  }));
}

async function fetchFaqs() {
  try {
    return (await getApi().content.faqs()).faqs;
  } catch (error) {
    console.error('Error loading FAQs from API:', error);
    return [];
  }
}
export default async function FaqsPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'FAQs', url: 'https://www.tecbunny.com/info/faqs' },
        ]}
      />
      {/* Header section with explicit bounding height to prevent CLS */}
      <div className="text-center mb-12 min-h-[120px] flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Quickly find answers to common queries about our system, pricing, and services.
        </p>
      </div>

      {/* Suspense wrapper with a layout-stable skeleton fallback matching exact bounds */}
      <Suspense fallback={<FaqsSkeleton />}>
        <FaqsLoader />
      </Suspense>
    </div>
  );
}

const FALLBACK_FAQS: FaqRow[] = [
  { id: 'wifi-goa', category: 'Services', question: 'Do you set up Wi-Fi networks in Goa?', answer: 'Yes. We set up Wi-Fi, LAN networks, and cable runs for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra. Support terms and handover details are confirmed in your written quote.', display_order: 1 },
  { id: 'amc-cover', category: 'Services', question: 'What does an AMC plan cover?', answer: 'An AMC (Annual Maintenance Contract) covers your CCTV or IT kit for the full year. It can include planned check-ups, remote support, on-site fixes, and audit reports, with response targets defined in your plan.', display_order: 2 },
  { id: 'outside-goa', category: 'Coverage', question: 'Do you serve areas outside Goa?', answer: 'Yes. We serve clients in Mumbai, Pune, and Nashik for large IT and CCTV jobs, and we run remote IT support for firms across India. For jobs outside Goa, call us to get a fast quote.', display_order: 3 },
  { id: 'cctv-cost', category: 'Pricing', question: 'How much does CCTV installation cost in Goa?', answer: 'It depends on camera count, cable runs, recorder capacity, and site conditions. We quote per site after a survey, with an itemized estimate so you can see hardware, cabling, and labour separately. Request a free assessment to get an exact figure.', display_order: 4 },
  { id: 'get-started', category: 'Getting Started', question: 'How do I get started with TecBunny?', answer: 'Three steps: book a free technology assessment, let our engineers survey your site and review your existing systems, then receive an itemized proposal with a clear scope and support plan. There is no obligation to proceed.', display_order: 5 },
];

async function FaqsLoader() {
  const fetched = await fetchFaqs();
  const faqs = normalizeFaqs(fetched.length > 0 ? fetched : FALLBACK_FAQS);

  // AEO: FAQPage structured data mirroring the visible FAQ list.
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtmlToPlainText(faq.answer),
      },
    })),
  } : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <FaqsClient initialFaqs={faqs} />
    </>
  );
}

// Layout-stable skeleton skeleton loader to prevent layout shifts (CLS)
function FaqsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Search box placeholder */}
      <div className="max-w-xl mx-auto h-12 bg-muted/40 rounded-full border border-muted/50 w-full" />

      {/* Categories filter placeholder */}
      <div className="flex justify-center gap-2 h-10 w-64 mx-auto bg-muted/20 rounded-full" />

      {/* Simulated Accordion items with exact structural dimensions */}
      <div className="space-y-4 min-h-[400px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[60px] bg-muted/30 border border-muted/45 rounded-xl w-full"
          />
        ))}
      </div>
    </div>
  );
}
