import type { Metadata } from 'next';

import { createPageMetadata } from '@tecbunny/core/metadata';

import { ServicePage } from '@/components/services/ServicePage';
import { rfidLocksService } from '@/content/services';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: rfidLocksService.title,
    description: rfidLocksService.metaDescription,
    path: '/services/rfid-locks',
    image: '/opengraph-image',
  });
}

export default function RfidLocksPage() {
  return <ServicePage content={rfidLocksService} />;
}
