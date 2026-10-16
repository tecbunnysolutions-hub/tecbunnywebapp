import type { Metadata } from 'next';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { ServicePage } from '@/components/services/ServicePage';
import { networkingService } from '@/content/services';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: networkingService.title,
    description: networkingService.metaDescription,
    path: '/services/networking',
    image: '/opengraph-image',
  });
}

export default function NetworkingPage() {
  return <ServicePage content={networkingService} />;
}
