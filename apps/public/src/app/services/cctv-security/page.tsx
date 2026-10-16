import type { Metadata } from 'next';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { ServicePage } from '@/components/services/ServicePage';
import { cctvService } from '@/content/services';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: cctvService.title,
    description: cctvService.metaDescription,
    path: '/services/cctv-security',
    image: '/opengraph-image',
  });
}

export default function CctvSecurityPage() {
  return <ServicePage content={cctvService} />;
}
