import { Metadata } from 'next';
import { createPageMetadata } from '@tecbunny/core/metadata';

import OffersPage from '@/components/offers-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Special Offers & Deals - TecBunny Store',
    description: 'Discover amazing deals and special offers on the latest technology products at TecBunny Store.',
    keywords: ['offers', 'deals', 'discounts', 'TecBunny', 'special prices', 'technology deals'],
    path: '/offers',
  });
}

// Force static generation
// export const dynamic = 'force-static';

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Offers', url: 'https://www.tecbunny.com/offers' },
        ]}
      />
      <OffersPage />
    </>
  );
}
