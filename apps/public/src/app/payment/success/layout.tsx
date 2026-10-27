import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Payment confirmation | TecBunny",
  description: "Review your payment confirmation and order details.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
