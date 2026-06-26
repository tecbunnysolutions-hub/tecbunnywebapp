import { Suspense } from 'react';

import type { Metadata } from 'next';

import HomePage from '@/components/home-page';
import { createPageMetadata } from '@/lib/metadata';

// Revalidate homepage every 60 seconds (ISR) to fix 2.8s Document Request Latency
export const revalidate = 60;

import { headers } from 'next/headers';

// Homepage metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'TecBunny | Tech Services, CCTV & AMC Solutions',
  description:
    'TecBunny Solutions engineered premium IT services, CCTV installation, AMC support, home automation, and custom hardware setups in Goa and Maharashtra.',
  keywords: [
    'tech services',
    'custom setup',
    'technology support',
    'hardware solutions',
    'technical services',
    'IT support',
    'TecBunny',
  ],
  path: '/',
  image: '/brand.png',
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

function parsePartnerBrands(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item: any) => ({
        name: typeof item === 'object' && item?.name ? String(item.name).trim() : '',
        logoUrl: typeof item === 'object' && item?.logoUrl ? String(item.logoUrl).trim() : '',
      }))
      .filter((brand) => brand.name.length > 0);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('[')) {
    try {
      return parsePartnerBrands(JSON.parse(trimmed));
    } catch {
      return undefined;
    }
  }

  return trimmed
    .split(',')
    .map((name) => ({ name: name.trim(), logoUrl: '' }))
    .filter((brand) => brand.name.length > 0);
}

export default async function Page() {
  let initialProducts = undefined;
  let initialPartnerBrands = undefined;
  let initialHeroCarousel = undefined;

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Parallel server-side fetching with ISR caching
    const [productsRes, brandsRes, heroRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?status=active&limit=12`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${baseUrl}/api/settings?key=partnerBrands`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${baseUrl}/api/page-content?key=hero-carousels`, { next: { revalidate: 60 } }).catch(() => null)
    ]);

    if (productsRes?.ok) {
      const payload = await productsRes.json();
      const items = Array.isArray(payload?.data) ? payload.data : [];
      
      const hasAnyImage = (item: any) => {
        if (item.image) return true;
        if (Array.isArray(item.images) && item.images.length) return true;
        if (item.image_urls) return true;
        return false;
      };
      
      const itemsWithImages = items.filter(hasAnyImage);
      initialProducts = (itemsWithImages.length ? itemsWithImages : items).slice(0, 4);
    }

    if (brandsRes?.ok) {
      const payload = await brandsRes.json();
      initialPartnerBrands = parsePartnerBrands(payload?.value);
    }

    if (heroRes?.ok) {
      const payload = await heroRes.json();
      initialHeroCarousel = payload?.data ?? null;
    }
  } catch (error) {
    console.error('Error prefetching data for homepage:', error);
  }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage 
        initialProducts={initialProducts} 
        initialPartnerBrands={initialPartnerBrands} 
        initialHeroCarousel={initialHeroCarousel}
      />
    </Suspense>
  );
}
