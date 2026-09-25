'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

type State = 'verifying' | 'paid' | 'failed' | 'pending';

function ConfirmContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : (params.orderId as string);
  // The server includes the persisted merchant reference in the return URL.
  const cfOrderId = searchParams.get('order_id');

  const [state, setState] = useState<State>('verifying');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!cfOrderId || !orderId) {
      setState('failed');
      return;
    }

    setState('verifying');
    fetch(`/api/payments/cashfree/verify?cf_order_id=${encodeURIComponent(cfOrderId)}&order_id=${encodeURIComponent(orderId)}`)
      .then(async r => {
        if (!r.ok) { setState('pending'); return; }
        const data = await r.json();
        setState(data.is_paid ? 'paid' : ['EXPIRED', 'TERMINATED'].includes(data.order_status) ? 'failed' : 'pending');
      })
      .catch(() => setState('pending'));
  }, [cfOrderId, orderId, attempt]);

  if (state === 'pending') return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">Confirmation pending</h1>
        <p>Your payment may have been received. Retry verification before making another payment.</p>
        <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg" onClick={() => setAttempt(value => value + 1)}>Retry verification</button>
      </div>
    </div>
  );

  if (state === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (state === 'paid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Successful</h1>
          <p className="text-sm text-muted-foreground">
            Your payment has been confirmed and your order is being processed.
          </p>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            View Orders <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Payment Not Completed</h1>
        <p className="text-sm text-muted-foreground">
          The payment was not successful or was cancelled. You can try again from your cart.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/30 transition-colors"
          >
            Back to Cart
          </button>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            My Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
