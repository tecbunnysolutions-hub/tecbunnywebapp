import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Verify your code | TecBunny",
  description: "Enter the verification code sent to you.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
