import type { Metadata } from 'next';
import { createPageMetadata } from '@tecbunny/core/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'AI Research Assistant | TecBunny Solutions',
    description: 'Run AI-assisted research and get product recommendations tailored to your requirements.',
    keywords: ['AI research', 'product recommendations', 'TecBunny', 'solutions', 'technology'],
    path: '/ai-research',
  });
}

export default function AiResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
