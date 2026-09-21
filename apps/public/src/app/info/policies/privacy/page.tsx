import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Privacy Policy',
    description: 'Read how TecBunny Solutions collects, stores, and protects your personal information.',
    path: '/info/policies/privacy',
  });
}

export default async function PrivacyPolicyPage() {
  const content = await getPolicyContent('privacy_policy', 'Privacy Policy');
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'Policies', url: 'https://www.tecbunny.com/info/policies' },
          { name: 'Privacy Policy', url: 'https://www.tecbunny.com/info/policies/privacy' },
        ]}
      />
      <PolicyPage pageKey="privacy_policy" defaultTitle="Privacy Policy" initialContent={content} />
    </>
  );
}
