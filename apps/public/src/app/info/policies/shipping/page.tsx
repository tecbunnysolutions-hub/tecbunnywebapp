import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Shipping Policy',
    description: 'Understand TecBunny Solutions shipping timelines, delivery expectations, and logistics terms.',
    path: '/info/policies/shipping',
  });
}

export default async function ShippingPolicyPage() {
  const content = await getPolicyContent('shipping_policy', 'Shipping Policy');
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Policies', url: 'https://www.tecbunny.com/info/policies' },
          { name: 'Shipping Policy', url: 'https://www.tecbunny.com/info/policies/shipping' },
        ]}
      />
      <PolicyPage pageKey="shipping_policy" defaultTitle="Shipping Policy" initialContent={content} />
    </>
  );
}
