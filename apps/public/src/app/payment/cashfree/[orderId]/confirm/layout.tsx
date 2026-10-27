import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Confirm your payment | TecBunny",
  description: "Review the payment confirmation for your order.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
