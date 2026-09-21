import type { Metadata } from 'next';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Technology Solutions & Case Studies Goa | TecBunny Solutions',
    description: 'Real deployments across Goa: CCTV surveillance, enterprise networking, smart automation, and IT infrastructure for hotels, offices, clinics, and residences.',
    keywords: [
      'technology case studies Goa',
      'CCTV deployment examples',
      'enterprise network projects',
      'smart automation solutions',
      'TecBunny Solutions',
    ],
    path: '/solutions',
    image: '/brand.png',
  });
}

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Solutions', url: 'https://www.tecbunny.com/solutions' },
        ]}
      />
      {children}
    </>
  );
}
