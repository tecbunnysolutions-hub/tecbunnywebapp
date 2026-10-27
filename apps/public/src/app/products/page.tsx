import { getApi } from '@/lib/api';
import Link from 'next/link';
import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ShopPageContent } from '@/components/products/ShopPageContent';
import { ProductsSeoContent } from '@/components/products/ProductsSeoContent';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { createPageMetadata } from "@tecbunny/core/metadata";
import { getCatalogByCategory } from '@/lib/product-categories';
import { deduplicateCatalogProducts, getCatalogProductDisplayName } from '@/lib/product-catalog';

// Catalogue data is cached at the API (60s, tag "products"); the page revalidates on the same cadence.
export const revalidate = 60;

const PRODUCTS_PAGE_SIZE = 200;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
  title: 'CCTV, Computers & IT Products in Goa | TecBunny',
  description: 'Shop CCTV cameras, computers, networking gear and accessories for homes and small businesses. Browse live prices and request installation in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
  keywords: ['shop', 'products', 'CCTV', 'computers', 'accessories', 'TecBunny'],
  path: '/products',
  image: '/opengraph-image',
});
}

function ProductsPageSkeleton() {
  return (
    <div className="relative min-h-screen bg-background text-muted-foreground font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--overlay))_70%,transparent_100%)] pointer-events-none" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 bg-secondary/5 blur-[120px]" />
      <section className="py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-6 w-28 bg-card border border-border rounded-full animate-pulse" />
              <div className="h-14 w-80 bg-card/60 rounded-xl animate-pulse" />
              <div className="h-4 w-72 bg-card/60 rounded-lg animate-pulse animate-pulse" />
            </div>
            <div className="w-full max-w-lg h-11 bg-card/40 border border-border rounded-xl animate-pulse" />
          </div>
          <div className="mt-16 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex h-full w-full max-w-[320px] mx-auto sm:mx-0 flex-col rounded-2xl border border-border bg-background/40 p-6 animate-pulse">
                <div className="aspect-square w-full rounded-xl bg-card/60 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 w-1/4 bg-card/60 rounded" />
                  <div className="h-5 w-3/4 bg-card/60 rounded" />
                  <div className="h-4 w-5/6 bg-card/60 rounded" />
                </div>
                <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
                  <div className="h-6 w-20 bg-card/60 rounded" />
                  <div className="h-9 w-9 bg-card/60 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ShopPageDataLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopPageDataLoader({ searchParams }: { searchParams?: Promise<Record<string, string>> | Record<string, string> }) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const page = Math.max(1, Number(resolvedParams?.page ?? '1') || 1);
  const from = (page - 1) * PRODUCTS_PAGE_SIZE;
  const { categories } = await getCatalogByCategory();

  const { products: rawProducts, offers: rawOffers, total } = await getApi().products.list({
    page,
    pageSize: PRODUCTS_PAGE_SIZE,
  });
  const uniqueProducts = deduplicateCatalogProducts(rawProducts as Array<Record<string, unknown> & { id: string | number }>);
  // SEO/AEO: CollectionPage + ItemList structured data for the product catalogue
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.tecbunny.com/products#collection',
    url: 'https://www.tecbunny.com/products',
    name: 'TecBunny Product Catalogue',
    description: 'CCTV cameras, computers, networking gear and accessories for homes and small businesses in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.',
    isPartOf: { '@id': 'https://www.tecbunny.com/#website' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: uniqueProducts.length,
      itemListElement: uniqueProducts.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: from + index + 1,
        url: `https://www.tecbunny.com/products/${product.id}`,
        name: getCatalogProductDisplayName(product),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Products', url: 'https://www.tecbunny.com/products' },
        ]}
      />
      <ShopPageContent initialRawProducts={uniqueProducts as typeof rawProducts} initialRawAutoOffers={rawOffers} />
      {categories.length > 0 && (
        <nav aria-label="Browse by category" className="mx-auto max-w-7xl px-6 pb-12 sm:px-8">
          <h2 className="text-xl font-bold text-foreground">Browse by category</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/products/category/${category.slug}`} className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary">
                  {category.name.split(' > ').join(' / ')} ({category.count})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <ProductsSeoContent />
    </>
  );
}
