'use client';

type PublicRouteErrorProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function PublicRouteError({ title, description, reset }: PublicRouteErrorProps) {
  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-5" />
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-20 sm:px-6 lg:px-8">
        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-destructive">
          Please try again
        </span>
        <h1 role="alert" className="mt-6 text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Try again
          </button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-input px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">Reload page</button>
          <a
            href="/contact"
            className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
