import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Seller verification | TecBunny",
  description: "Review and complete your seller verification details.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
