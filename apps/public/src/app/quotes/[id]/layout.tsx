import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Your quote | TecBunny",
  description: "Review the proposed scope, pricing and available next steps.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
