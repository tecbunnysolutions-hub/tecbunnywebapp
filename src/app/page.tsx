import { Suspense } from 'react';

import type { Metadata } from 'next';

import HomePage from '@/components/home-page';
import { createPageMetadata } from '@/lib/metadata';

// Force dynamic rendering for homepage as requested
export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';

// Homepage metadata for SEO
export const metadata: Metadata = createPageMetadata({
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

export default async function Page() {
  let initialProducts = undefined;
  let initialPartnerBrands = undefined;

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Parallel server-side fetching
    const [productsRes, brandsRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?status=active&limit=12`, { cache: 'no-store' }).catch(() => null),
      fetch(`${baseUrl}/api/settings?key=partnerBrands`, { next: { revalidate: 3600 } }).catch(() => null)
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
      const brandsStr = payload?.value;
      if (brandsStr && typeof brandsStr === 'string') {
        const trimmed = brandsStr.trim();
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              initialPartnerBrands = parsed.map((item: any) => ({
                name: typeof item === 'object' && item?.name ? String(item.name) : '',
                logoUrl: typeof item === 'object' && item?.logoUrl ? String(item.logoUrl) : '',
              }));
            }
          } catch (e) {}
        } else {
          initialPartnerBrands = trimmed
            .split(',')
            .map((b: string) => ({ name: b.trim(), logoUrl: '' }))
            .filter((b: { name: string; logoUrl: string }) => b.name.length > 0);
        }
      }
    }
  } catch (error) {
    console.error('Error prefetching data for homepage:', error);
  }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage 
        initialProducts={initialProducts} 
        initialPartnerBrands={initialPartnerBrands} 
      />
    </Suspense>
  );
}
