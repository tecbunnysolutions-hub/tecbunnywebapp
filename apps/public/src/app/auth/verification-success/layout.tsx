import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Email verified | TecBunny",
  description: "Continue after verifying your TecBunny email address.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
