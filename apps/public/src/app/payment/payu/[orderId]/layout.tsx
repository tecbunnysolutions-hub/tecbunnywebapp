import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pay for your order | TecBunny",
  description: "Continue to the payment step for your order.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
