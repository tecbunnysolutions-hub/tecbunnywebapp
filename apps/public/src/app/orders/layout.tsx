import type { Metadata } from 'next';

// Order pages are private account surfaces — never index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Auth-gated route: middleware enforces a per-request nonce-based CSP here,
// which requires dynamic rendering so framework scripts receive the nonce.
export const dynamic = 'force-dynamic';

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
