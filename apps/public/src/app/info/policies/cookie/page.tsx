import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Cookie Policy',
    description: 'Read how TecBunny Solutions uses cookies and local storage.',
    path: '/info/policies/cookie',
  });
}

export default async function CookiePolicyPage() {
  const content = await getPolicyContent('cookie_policy', 'Cookie Policy');
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Policies', url: 'https://www.tecbunny.com/info/policies' },
          { name: 'Cookie Policy', url: 'https://www.tecbunny.com/info/policies/cookie' },
        ]}
      />
      <PolicyPage pageKey="cookie_policy" defaultTitle="Cookie Policy" initialContent={content} />
    </>
  );
}
