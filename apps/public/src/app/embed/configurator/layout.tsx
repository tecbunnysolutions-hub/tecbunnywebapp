import type { Metadata } from 'next';

// The embed configurator is rendered inside third-party iframes — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
