import { Suspense } from 'react';
import { Metadata } from 'next';

import ContactPage from '@/components/contact-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { createPageMetadata } from "@tecbunny/core/metadata";

// Static metadata for better SEO and performance
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'Contact TecBunny in Goa',
  description: 'Contact TecBunny for CCTV, IT support, RFID locks, networking and website development in North Goa and the Sawantwadi area.',
  path: '/contact',
  image: '/brand.png',
});
}

// Force static generation
// export const dynamic = 'force-static';

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://www.tecbunny.com/contact#contactpage',
  url: 'https://www.tecbunny.com/contact',
  name: 'Contact TecBunny Solutions',
  description: 'Contact TecBunny for CCTV, IT support, RFID locks, networking and website development.',
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
          Hours: Monday to Saturday, 9:30 AM - 7:30 PM
        </address>
        <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">Grievance Officer</h2>
        <address className="not-italic leading-relaxed">
          Shubham Bhisaji<br />
          Phone: <a href="tel:+917387375651" className="text-primary">7387375651</a><br />
          Email: <a href="mailto:shubham@tecbunny.com" className="text-primary">shubham@tecbunny.com</a>
        </address>
      </section>
    </>
  );
}
