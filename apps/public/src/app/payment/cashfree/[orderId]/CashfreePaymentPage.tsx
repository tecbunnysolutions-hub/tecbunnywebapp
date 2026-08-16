'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';
import { AlertCircle, ArrowLeft } from 'lucide-react';

type Status = 'loading' | 'redirecting' | 'error';

function normalizeOrderId(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (!s || s === 'undefined' || s === 'null') return null;
  return input.trim();
}

export default function CashfreePaymentPage() {
  const params = useParams();
  const orderId = normalizeOrderId(
    Array.isArray(params.orderId) ? params.orderId[0] : params.orderId
  );
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!orderId) {
      setErrorMsg('Invalid order ID.');
      setStatus('error');
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        // Step 1 — create Cashfree order and get session ID
        const orderRes = await fetch('/api/payments/cashfree/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error((err as any).error || 'Failed to create payment session');
        }

        const { payment_session_id } = await orderRes.json();
        if (cancelled) return;

        // Step 2 — initialise SDK
        const cashfree = await load({
          mode:
            (process.env.NEXT_PUBLIC_CASHFREE_ENV as 'sandbox' | 'production' | undefined) ||
            'production',
        });

        if (cancelled || !cashfree) return;
        setStatus('redirecting');

        // Step 3 — open redirect checkout (same tab)
        await cashfree.checkout({
          paymentSessionId: payment_session_id,
          redirectTarget: '_self',
        });
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Payment initialisation failed');
          setStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [orderId]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">Payment Error</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-primary mx-auto hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 mx-auto animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          {status === 'redirecting' ? 'Opening payment page…' : 'Setting up secure payment…'}
        </p>
      </div>
    </div>
  );
}
