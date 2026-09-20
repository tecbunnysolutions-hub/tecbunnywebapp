import type { Metadata } from 'next';

// Order pages are private account surfaces — never index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
