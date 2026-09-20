import type { Metadata } from 'next';

// Payment flows are transactional surfaces — never index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
