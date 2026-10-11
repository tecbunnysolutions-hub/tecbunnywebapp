import { Suspense } from 'react';
import { Metadata } from 'next';

import ContactPage from '@/components/contact-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { createPageMetadata } from "@tecbunny/core/metadata";

// Static metadata for better SEO and performance
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'Contact TecBunny Solutions',
  description: 'Get in touch with TecBunny Solutions for technology services, custom solutions, and technical support.',
  keywords: ['contact TecBunny', 'technology support', 'technical services', 'customer support'],
  path: '/contact',
  image: '/brand.png',
});
}

// Force static generation
// export const dynamic = 'force-static';

const contactFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you offer site visits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TecBunny provides service coverage across Goa and selected Maharashtra locations. Site consultation visits are available in North Goa, South Goa, and selected Maharashtra locations, subject to project availability.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast is installation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard home CCTV setups with up to 8 cameras are typically completed within 24 to 48 hours after confirmation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does AMC cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our AMC service includes proactive maintenance, software updates, lens cleaning, and priority breakdown support. Hardware replacement costs are separate unless covered by warranty.',
      },
    },
  ],
};

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://www.tecbunny.com/contact#contactpage',
  url: 'https://www.tecbunny.com/contact',
  name: 'Contact TecBunny Solutions',
  description: 'Get in touch with TecBunny Solutions for technology services, custom solutions, and technical support.',
  isPartOf: { '@id': 'https://www.tecbunny.com/#website' },
  about: { '@id': 'https://www.tecbunny.com/#localbusiness' },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Contact', url: 'https://www.tecbunny.com/contact' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactFaqJsonLd).replace(/</g, '\\u003c') }}
      />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ContactPage />
      </Suspense>
      <section aria-label="Contact details" className="container mx-auto max-w-4xl px-4 pb-16 text-sm text-muted-foreground">
        <h2 className="mb-3 text-xl font-bold text-foreground">Contact details</h2>
        <address className="not-italic leading-relaxed">
          TECBUNNY SOLUTIONS PRIVATE LIMITED<br />
          H. No. 11, Nhayginwada, Parcem, Pernem, North Goa, Goa - 403512<br />
          Phone / WhatsApp: <a href="tel:+919604136010" className="text-primary">+91 96041 36010</a><br />
          Email: <a href="mailto:support@tecbunny.com" className="text-primary">support@tecbunny.com</a><br />
          Hours: Monday to Saturday, 9:30 AM - 6:30 PM
        </address>
      </section>
    </>
  );
}
