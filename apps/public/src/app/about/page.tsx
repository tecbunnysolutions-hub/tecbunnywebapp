import { Metadata } from 'next';

import AboutPage from '@/components/about-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { createPageMetadata } from "@tecbunny/core/metadata";
import { ENTITY } from '@/lib/entity';

// Static metadata for better SEO and performance
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'About TecBunny Solutions in Goa',
  description: ENTITY.description,
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
  description: ENTITY.description,
  isPartOf: { '@id': 'https://www.tecbunny.com/#website' },
  about: { '@id': 'https://www.tecbunny.com/#organization' },
  mainEntity: { '@id': 'https://www.tecbunny.com/#localbusiness' },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'About', url: 'https://www.tecbunny.com/about' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd).replace(/</g, '\\u003c') }}
      />
      <AboutPage />
    </>
  );
}
