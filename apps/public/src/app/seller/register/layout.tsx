import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create a seller account | TecBunny",
  description: "Start your TecBunny seller registration.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
