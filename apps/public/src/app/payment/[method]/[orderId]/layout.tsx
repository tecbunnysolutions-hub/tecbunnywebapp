import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Order payment | TecBunny",
  description: "Complete the selected payment step for your order.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
