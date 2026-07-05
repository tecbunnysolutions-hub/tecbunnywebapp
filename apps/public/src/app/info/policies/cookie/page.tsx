import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { getPolicyContent } from "@tecbunny/core/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Read how TecBunny Solutions uses cookies and local storage.',
};

export default async function CookiePolicyPage() {
  const content = await getPolicyContent('cookie_policy', 'Cookie Policy');
  return <PolicyPage pageKey="cookie_policy" defaultTitle="Cookie Policy" initialContent={content} />;
}
