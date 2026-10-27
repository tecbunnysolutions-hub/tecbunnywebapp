import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Payment not completed | TecBunny",
  description: "Check your order and choose the next step after an unsuccessful payment.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
