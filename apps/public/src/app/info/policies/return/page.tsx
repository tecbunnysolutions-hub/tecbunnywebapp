import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Return & Exchange Policy',
    description: 'Read TecBunny Solutions return and exchange terms for eligible products and service scenarios.',
    path: '/info/policies/return',
  });
}

export default async function ReturnPolicyPage() {
  const content = await getPolicyContent('return_policy', 'Return & Exchange Policy');
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Policies', url: 'https://www.tecbunny.com/info/policies' },
          { name: 'Return & Exchange Policy', url: 'https://www.tecbunny.com/info/policies/return' },
        ]}
      />
      <PolicyPage pageKey="return_policy" defaultTitle="Return & Exchange Policy" initialContent={content} />
    </>
  );
}
