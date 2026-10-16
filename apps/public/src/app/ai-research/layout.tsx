import type { Metadata } from 'next';
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  // noindex: internal AI tool; keep it out of search until it is useful to customers.
  const meta = await createPageMetadata({
    title: 'AI Research Assistant | TecBunny Solutions',
    description: 'Run AI-assisted research and get product recommendations tailored to your requirements.',
    path: '/ai-research',
  });
  return { ...meta, robots: { index: false, follow: false } };
}

export default function AiResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'AI Research', url: 'https://www.tecbunny.com/ai-research' },
        ]}
      />
      {children}
    </>
  );
}
