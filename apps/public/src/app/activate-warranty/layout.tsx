import type { Metadata } from 'next';

// Warranty activation is a serial-specific utility route — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ActivateWarrantyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
