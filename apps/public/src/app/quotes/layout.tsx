import type { Metadata } from 'next';

// Quote pages are private transactional surfaces — never index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
