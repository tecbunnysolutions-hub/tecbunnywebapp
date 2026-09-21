import type { Metadata } from 'next';

// Profile is a private account surface — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Auth-gated route: middleware enforces a per-request nonce-based CSP here,
// which requires dynamic rendering so framework scripts receive the nonce.
export const dynamic = 'force-dynamic';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
