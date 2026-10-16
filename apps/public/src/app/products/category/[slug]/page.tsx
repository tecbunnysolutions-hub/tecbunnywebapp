import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createPageMetadata } from '@tecbunny/core/metadata';
import { resolvePublicProductPrice } from '@tecbunny/core/product-visibility';

import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { formatInr } from '@/content/pricing';
import { getCatalogByCategory } from '@/lib/product-categories';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const SITE = 'https://www.tecbunny.com';

async function resolveCategory(slug: string) {
  const catalog = await getCatalogByCategory();
  const category = catalog.categories.find((item) => item.slug === slug);
  return { catalog, category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await resolveCategory(slug);
  if (!category) {
    return createPageMetadata({ title: 'Category Not Found', description: 'The requested category could not be found.', path: `/products/category/${slug}` });
  }
  const categoryLabel = category.name.split(' > ').join(' / ');
  return createPageMetadata({
    title: `${categoryLabel} in Goa | TecBunny`,
    description: `Buy ${categoryLabel} from TecBunny. Genuine products with installation and support in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.`,
    path: `/products/category/${slug}`,
    image: '/opengraph-image',
  });
}

export default async function ProductCategoryPage({ params }: Props) {
  const { slug } = await params;
  const { catalog, category } = await resolveCategory(slug);
  if (!category) notFound();

  const products = catalog.productsInCategory(category.name);
  const leaf = category.name.split(' > ').pop() ?? category.name;
  const categoryLabel = category.name.split(' > ').join(' / ');
  const pageUrl = `${SITE}/products/category/${slug}`;
  const related = catalog.categories.filter((item) => item.slug !== slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    url: pageUrl,
    name: categoryLabel,
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE}/products/${product.id}`,
        name: String(product.name ?? product.title ?? ''),
      })),
    },
  };

  return (
    <main className="bg-zinc-950 text-white">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SITE },
          { name: 'Products', url: `${SITE}/products` },
          { name: leaf, url: pageUrl },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <section className="tb-container py-12 sm:py-16">
        <Link href="/products" className="text-sm font-semibold text-blue-300 hover:text-white">&larr; All products</Link>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">{categoryLabel}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
          {products.length} {products.length === 1 ? 'product' : 'products'} from TecBunny. We can supply and install them in North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra; the final price for installation work is confirmed in a written quote.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const image = (product.image ?? product.image_url) as string | undefined;
            const name = String(product.name ?? product.title ?? 'Product');
            const price = resolvePublicProductPrice(product);
            return (
              <li key={String(product.id)} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <Link href={`/products/${product.id}`} className="block">
                  {image ? (
                    <Image src={image} alt={name} width={400} height={400} unoptimized className="aspect-square w-full bg-white object-contain" />
                  ) : (
                    <div className="aspect-square w-full bg-zinc-800" />
                  )}
                  <div className="p-4">
                    <h2 className="line-clamp-2 font-semibold">{name}</h2>
                    <p className="mt-2 font-bold text-blue-300">{formatInr(price)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {related.length > 0 && (
          <nav aria-label="Other categories" className="mt-14">
            <h2 className="text-2xl font-bold">Other categories</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/products/category/${item.slug}`} className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-blue-400">
                    {item.name.split(' > ').join(' / ')} ({item.count})
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>
    </main>
  );
}
