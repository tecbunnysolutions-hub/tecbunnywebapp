import type { Metadata } from 'next';

// Seller onboarding/dashboard surfaces are utility routes — never index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
