import { Suspense } from 'react';
import type { Metadata } from 'next';
import CashfreePaymentPage from './CashfreePaymentPage';

export const metadata: Metadata = {
  title: 'Processing Payment | TecBunny',
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CashfreePaymentPage />
    </Suspense>
  );
}
