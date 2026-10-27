import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create your account | TecBunny',
  description: 'Create a TecBunny Solutions account to request quotes, track orders, and manage support securely.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}