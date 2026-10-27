import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Search TecBunny | TecBunny",
  description: "Find products and technology services from TecBunny.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
