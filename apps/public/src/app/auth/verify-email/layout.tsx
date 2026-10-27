import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Verify your email | TecBunny",
  description: "Confirm your email address to continue with your account.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
