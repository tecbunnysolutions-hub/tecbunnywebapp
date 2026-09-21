import type { Metadata } from 'next';

// Checkout is a private transactional surface — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Auth-gated route: middleware enforces a per-request nonce-based CSP here,
// which requires dynamic rendering so framework scripts receive the nonce.
// (Marketing pages are static/ISR; only protected trees opt back into dynamic.)
export const dynamic = 'force-dynamic';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
