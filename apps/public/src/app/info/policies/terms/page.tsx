import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Terms of Service',
    description: 'Review the terms and conditions for using TecBunny Solutions services and storefront features.',
    path: '/info/policies/terms',
  });
}

export default async function TermsAndConditionsPage() {
  const content = await getPolicyContent('terms_of_service', 'Terms of Service');
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Policies', url: 'https://www.tecbunny.com/info/policies' },
          { name: 'Terms of Service', url: 'https://www.tecbunny.com/info/policies/terms' },
        ]}
      />
      <PolicyPage pageKey="terms_of_service" defaultTitle="Terms of Service" initialContent={content} />
    </>
  );
}
