import type { MetadataRoute } from 'next';
import { getApi } from '@/lib/api';
import { getCatalogByCategory } from '@/lib/product-categories';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.tecbunny.com';
  const now = new Date();
  let productRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  let blueprintRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];

  try {
    for (let page = 1; page <= 20; page += 1) {
      const { products, total, pageSize } = await getApi().products.list({ page, pageSize: 500 });
      productRoutes.push(
        ...products.map((product) => ({
          url: `${baseUrl}/products/${product.id}`,
          lastModified: typeof product.updated_at === 'string' ? new Date(product.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
      );
      if (products.length === 0 || page * pageSize >= total) break;
    }
  } catch (error) {
    console.warn('Failed to fetch sitemap product routes', error);
  }
  try {
    const { categories } = await getCatalogByCategory();
    productRoutes.push(
      ...categories.map((category) => ({
        url: `${baseUrl}/products/category/${category.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    );
  } catch (error) {
    console.warn('Failed to fetch sitemap category routes', error);
  }
  try {
    const { blueprints } = await getApi().blueprints.list();
    blueprintRoutes = blueprints.map((blueprint) => ({
      url: `${baseUrl}/blueprints/${blueprint.id}`,
      lastModified: blueprint.updated_at ? new Date(blueprint.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.warn('Failed to fetch sitemap blueprint routes', error);
  }
  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/customised-setups`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/cctv-security`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/it-support`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/rfid-locks`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/networking`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/assessment`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources/infrastructure-planning-guide`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources/cctv-planning-guide`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webdev`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },

    {
      url: `${baseUrl}/info/faqs`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/info/policies`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/privacy`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/cookie`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/refund-cancellation`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/return`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/shipping`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/info/policies/terms`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Blog routes
  let blogRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const api = getApi();
    for (let page = 1; page <= 20; page += 1) {
      const { posts, total, pageSize } = await api.blog.list({ page, pageSize: 50 });
      blogRoutes.push(
        ...posts.map((p) => ({
          url: `${baseUrl}/blog/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
      );
      if (posts.length === 0 || page * pageSize >= total) break;
    }
  } catch (error) {
    console.warn('Failed to fetch sitemap blog routes', error);
  }

  // Static pages have no real modified date; omit it rather than report "now" on every request.
  type StaticEntry = {
    url: string;
    lastModified?: Date | string;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  };

  const extraStaticRoutes: StaticEntry[] = [
    { url: `${baseUrl}/about/business-info`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/agents/recruit`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const staticEntries: StaticEntry[] = [
    ...staticRoutes
      .filter(({ url }) => ![
        '/services/computers-mobiles',
        '/services/networking-internet',
        '/services/network-infrastructure',
        '/services/network-infrastructure/north-goa',
        '/services/physical-security',
        '/services/physical-security/pernem-home-theater',
        '/services/smart-access-control',
        '/services/lifecycle-hardware',
        '/services/software-system-admin',
        '/services/smart-infrastructure',
        '/industries',
        '/industries/hospitality',
        '/industries/offices',
        '/industries/education',
        '/industries/healthcare',
        '/industries/retail',
        '/industries/builders',
      ].some((path) => url === `${baseUrl}${path}`))
      .map(({ url, changeFrequency, priority }): StaticEntry => ({ url, changeFrequency, priority })),
    ...['/services/cctv-security', '/services/it-support', '/services/rfid-locks', '/services/networking'].map((path): StaticEntry => ({
      url: `${baseUrl}${path}`,
      changeFrequency: 'monthly',
      priority: 0.9,
    })),
    ...extraStaticRoutes,
  ];

  return [
    ...staticEntries,
    ...productRoutes,
    ...blueprintRoutes,
    ...blogRoutes,
  ] as MetadataRoute.Sitemap;
}
