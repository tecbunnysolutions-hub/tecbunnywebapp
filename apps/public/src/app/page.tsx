import { Suspense } from 'react';

import type { Metadata } from 'next';

import HomePage from '@/components/home-page';
import { createPageMetadata } from '@/lib/metadata';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Revalidate homepage every 60 seconds (ISR) to fix 2.8s Document Request Latency
export const revalidate = 60;


// Homepage metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'TecBunny | Enterprise IT Services & Managed ITES Solutions',
  description:
    'TecBunny Solutions provides enterprise-grade IT infrastructure, professional cybersecurity services, managed ITES back-office workflows, and custom technology integrations.',
  keywords: [
    'enterprise IT services',
    'managed ITES',
    'network infrastructure',
    'cybersecurity audit',
    'smart access control',
    'IT lifecycle management',
    'Goa IT partner',
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
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Parallel server-side fetching directly from DB (prevents Next.js internal API deadlocks)
    const [productsRes, brandsRes, heroRes] = await Promise.all([
      supabase.from('products').select('*').eq('status', 'active').limit(12),
      supabase.from('settings').select('value').eq('key', 'partnerBrands').maybeSingle(),
      supabase.from('page_content').select('data').eq('key', 'hero-carousels').maybeSingle()
    ]);

    if (productsRes.data && !productsRes.error) {
      const items = Array.isArray(productsRes.data) ? productsRes.data : [];
      
      const hasAnyImage = (item: any) => {
        if (item.image) return true;
        if (Array.isArray(item.images) && item.images.length) return true;
        if (item.image_urls) return true;
        return false;
      };
      
      const itemsWithImages = items.filter(hasAnyImage);
      initialProducts = (itemsWithImages.length ? itemsWithImages : items).slice(0, 4);
    }

    if (brandsRes.data && !brandsRes.error) {
      initialPartnerBrands = parsePartnerBrands(brandsRes.data.value);
    }

    if (heroRes.data && !heroRes.error) {
      initialHeroCarousel = heroRes.data.data ?? null;
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
