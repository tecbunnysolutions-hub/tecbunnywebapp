import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
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
  return <PolicyPage pageKey="cookie_policy" defaultTitle="Cookie Policy" initialContent={content} />;
}
