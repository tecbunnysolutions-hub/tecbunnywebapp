import type { Metadata } from 'next';

// Internal project-management tool — keep out of search and AI indexes.
export const metadata: Metadata = {
  title: 'Projects | TecBunny',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
