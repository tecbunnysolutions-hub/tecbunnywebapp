import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pay with UPI | TecBunny",
  description: "Review the UPI payment details for your order.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
