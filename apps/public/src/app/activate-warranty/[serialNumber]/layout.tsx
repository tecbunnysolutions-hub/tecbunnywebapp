import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Activate your warranty | TecBunny",
  description: "Register the warranty details for your TecBunny product.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
