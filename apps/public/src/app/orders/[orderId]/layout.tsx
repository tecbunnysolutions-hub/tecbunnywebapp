import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Order details | TecBunny",
  description: "Review your order status and details.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
