import type { Metadata } from 'next';

import PolicyPage from '@/components/policy-page';
import { getPolicyContent } from "@tecbunny/core/settings";
import { createPageMetadata } from '@tecbunny/core/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Refund & Cancellation Policy',
    description: 'Review TecBunny Solutions cancellation handling and refund eligibility conditions.',
    path: '/info/policies/refund-cancellation',
  });
}

export default async function RefundCancellationPolicyPage() {
  const content = await getPolicyContent('refund_cancellation_policy', 'Refund & Cancellation Policy');
  return <PolicyPage pageKey="refund_cancellation_policy" defaultTitle="Refund & Cancellation Policy" initialContent={content} />;
}
