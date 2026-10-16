import { Suspense, type ComponentProps } from 'react';

import type { Metadata } from 'next';

import HomePage from '@/components/home-page';
import { createPageMetadata } from "@tecbunny/core/metadata";
import { getApi } from '@/lib/api';
import { getStartingPrices } from '@/lib/starting-prices';

// Revalidate homepage every 60 seconds (ISR) to fix 2.8s Document Request Latency
export const revalidate = 60;

// Homepage metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'CCTV, IT Support & Websites in Goa | TecBunny',
  description:
    'CCTV, IT support, RFID locks, networking and website development for homes and small businesses in North Goa and the Sawantwadi area.',
  path: '/',
  image: '/opengraph-image',
});
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PartnerBrand = { name: string; logoUrl: string };
type HomePageProps = ComponentProps<typeof HomePage>;

function parsePartnerBrands(value: unknown): PartnerBrand[] {
  if (Array.isArray(value)) {
    return value
      .map((item: unknown) => {
        const record = item && typeof item === 'object'
          ? item as Record<string, unknown>
          : {};
        return {
          name: record.name ? String(record.name).trim() : '',
          logoUrl: record.logoUrl ? String(record.logoUrl).trim() : '',
        };
      })
      .filter((brand) => brand.name.length > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      return parsePartnerBrands(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  return trimmed
    .split(',')
    .map((name) => ({ name: name.trim(), logoUrl: '' }))
    .filter((brand) => brand.name.length > 0);
}

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageDataLoader />
    </Suspense>
  );
}

async function HomePageDataLoader() {
  let initialPartnerBrands: PartnerBrand[] = [];
  // Default to {} so HeroCarousel skips client-side fetch when no data is configured.
  let initialHeroCarousel: HomePageProps['initialHeroCarousel'] = {};

  try {
    const content = await getApi().content.home();
    initialPartnerBrands = parsePartnerBrands(content.partnerBrands);
    initialHeroCarousel = (content.heroCarousel ?? {}) as HomePageProps['initialHeroCarousel'];
  } catch (error) {
    console.error('Error prefetching data for homepage:', error);
  }

  return (
    <HomePage
      initialPartnerBrands={initialPartnerBrands}
      initialHeroCarousel={initialHeroCarousel}
      startingPrices={await getStartingPrices()}
    />
  );
}
