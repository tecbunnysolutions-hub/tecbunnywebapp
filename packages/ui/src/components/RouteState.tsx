'use client';

import Link from 'next/link';

export function RouteLoading({ label = 'Loading your workspace…' }: { label?: string }) {
  return <div role="status" aria-live="polite" className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 bg-background p-6 text-center text-muted-foreground">
    <span aria-hidden="true" className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
    <p>{label}</p>
  </div>;
}

export function RouteError({ reset }: { reset: () => void }) {
  return <div className="flex min-h-[60dvh] items-center justify-center bg-background p-6 text-foreground">
    <section className="tb-card w-full max-w-lg p-7 sm:p-9" aria-labelledby="route-error-heading">
      <p className="tb-kicker">A little interruption</p>
      <h1 id="route-error-heading" role="alert" className="mt-4 text-3xl">We couldn’t load this view.</h1>
      <p className="mt-4 text-muted-foreground">Try again to reload the view. If the problem continues, return to your workspace and choose another task.</p>
      <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={reset} className="tb-button">Try again</button><button type="button" onClick={() => window.location.reload()} className="tb-button tb-button-secondary">Reload page</button><Link href="/" className="inline-flex min-h-11 items-center font-semibold text-primary">Return to workspace</Link></div>
    </section>
  </div>;
}

export function RouteNotFound() {
  return <div className="flex min-h-[60dvh] items-center justify-center bg-background p-6 text-foreground">
    <section className="tb-card w-full max-w-lg p-7 sm:p-9" aria-labelledby="route-missing-heading"><p className="tb-kicker">Page not found</p><h1 id="route-missing-heading" className="mt-4 text-3xl">Let’s get you back on track.</h1><p className="mt-4 text-muted-foreground">This address doesn’t lead to an available page. Return to your workspace to find the view you need.</p><Link href="/" className="tb-button mt-7">Return to workspace</Link></section>
  </div>;
}
