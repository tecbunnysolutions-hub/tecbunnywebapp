import type { Metadata } from 'next';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { ServicePage } from '@/components/services/ServicePage';
import { itSupportService } from '@/content/services';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: itSupportService.title,
    description: itSupportService.metaDescription,
    path: '/services/it-support',
    image: '/opengraph-image',
  });
}

export default function ItSupportPage() {
  return <ServicePage content={itSupportService} />;
}
