import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Page Not Found | TecBunny Solutions',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6 max-w-prose">
        Sorry, we couldn’t find the page you’re looking for. It may have been moved or
        deleted.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-3">
        <Link href="/" className="tb-button">
          Explore TecBunny
        </Link>
        <Link href="/products" className="tb-button tb-button-secondary">
          Browse products
        </Link>
      </div>
    </div>
  );
}
