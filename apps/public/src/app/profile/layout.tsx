import type { Metadata } from 'next';

// Profile is a private account surface — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
