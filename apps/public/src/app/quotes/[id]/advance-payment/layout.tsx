import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Quote advance payment | TecBunny",
  description: "Review your quote and its advance payment details.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
