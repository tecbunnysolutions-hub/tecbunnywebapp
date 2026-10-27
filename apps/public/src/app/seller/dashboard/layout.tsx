import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Seller dashboard | TecBunny",
  description: "Manage your TecBunny seller account.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
