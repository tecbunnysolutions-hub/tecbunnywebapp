import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { getServiceContent } from '@/content/services';
import { ServicePage } from '@/components/services/ServicePage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const content = getServiceContent(category);

  if (!content) {
    return {};
  }

  return createPageMetadata({
    title: content.title,
    description: content.metaDescription,
    path: `/services/${content.slug}`,
    image: '/opengraph-image',
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const content = getServiceContent(category);

  if (!content) {
    notFound();
  }

  return <ServicePage content={content} />;
}
