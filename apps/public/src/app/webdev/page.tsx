import type { Metadata } from 'next';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { ServicePage } from '@/components/services/ServicePage';
import { webdevService } from '@/content/services';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: webdevService.title,
    description: webdevService.metaDescription,
    path: '/webdev',
    image: '/opengraph-image',
  });
}

export default function WebDevPage() {
  return <ServicePage content={webdevService} />;
}
