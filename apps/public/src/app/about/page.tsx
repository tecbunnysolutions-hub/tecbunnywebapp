import { Metadata } from 'next';

import AboutPage from '@/components/about-page';
import { createPageMetadata } from "@tecbunny/core/metadata";

// Static metadata for better SEO and performance
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'About TecBunny Solutions in Goa',
  description: 'Learn about TecBunny Solutions, a Goa-based technology partner for CCTV, IT services, AMC support, smart automation, and secure infrastructure.',
  keywords: ['about TecBunny', 'Goa IT company', 'CCTV company Goa', 'home automation Goa', 'technology partner Goa'],
  path: '/about',
  image: '/brand.png',
});
}

// Optimized for static generation
const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.tecbunny.com/about#aboutpage',
  url: 'https://www.tecbunny.com/about',
  name: 'About TecBunny Solutions',
  description: 'Learn about TecBunny Solutions, a Goa-based technology partner for CCTV, IT services, AMC support, smart automation, and secure infrastructure.',
  isPartOf: { '@id': 'https://www.tecbunny.com/#website' },
  about: { '@id': 'https://www.tecbunny.com/#organization' },
  mainEntity: { '@id': 'https://www.tecbunny.com/#localbusiness' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd).replace(/</g, '\\u003c') }}
      />
      <AboutPage />
    </>
  );
}
