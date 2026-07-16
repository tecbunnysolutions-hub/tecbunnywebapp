import { createClient } from '@tecbunny/database';
import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ShopPageContent } from '@/components/products/ShopPageContent';
import { logger } from '@tecbunny/core';
import { createPageMetadata } from "@tecbunny/core/metadata";
import { filterPubliclyVisibleProducts } from "@tecbunny/core/product-visibility";

// ISR: revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'Buy CCTV, IT Hardware & Security Systems | TecBunny',
  description: 'Shop premium CCTV systems, surveillance cameras, computer hardware, and accessories curated by TecBunny. Best pricing in Goa.',
  keywords: ['shop', 'products', 'CCTV', 'computers', 'accessories', 'TecBunny'],
  path: '/products',
  image: '/brand.png',
});
}

function ProductsPageSkeleton() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 bg-zinc-500/5 blur-[120px]" />
      <section className="py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-6 w-28 bg-zinc-900 border border-zinc-800 rounded-full animate-pulse" />
              <div className="h-14 w-80 bg-zinc-900/60 rounded-xl animate-pulse" />
              <div className="h-4 w-72 bg-zinc-900/60 rounded-lg animate-pulse animate-pulse" />
            </div>
            <div className="w-full max-w-lg h-11 bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse" />
          </div>
          <div className="mt-16 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex h-full w-full max-w-[320px] mx-auto sm:mx-0 flex-col rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 animate-pulse">
                <div className="aspect-square w-full rounded-xl bg-zinc-900/60 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 w-1/4 bg-zinc-900/60 rounded" />
                  <div className="h-5 w-3/4 bg-zinc-900/60 rounded" />
                  <div className="h-4 w-5/6 bg-zinc-900/60 rounded" />
                </div>
                <div className="mt-8 flex items-center justify-between pt-4 border-t border-zinc-900">
                  <div className="h-6 w-20 bg-zinc-900/60 rounded" />
                  <div className="h-9 w-9 bg-zinc-900/60 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ShopPageDataLoader />
    </Suspense>
  );
}

async function ShopPageDataLoader() {
  const supabase = await createClient();
  
  const [productsRes, offersRes] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'active').limit(200),
    supabase.from('auto_offers').select('*').eq('is_active', true)
  ]);

  const rawProducts = filterPubliclyVisibleProducts(productsRes.data || []);
  const rawOffers = offersRes.data || [];

  return (
    <ShopPageContent initialRawProducts={rawProducts} initialRawAutoOffers={rawOffers} />
  );
}
