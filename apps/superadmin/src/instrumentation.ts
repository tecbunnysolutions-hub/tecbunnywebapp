import { registerTelemetry } from '@tecbunny/core/telemetry';

export async function register() {
  registerTelemetry('superadmin');

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // @ts-expect-error -- optional peer dependency
      const Sentry = await import(/* webpackIgnore: true */ '@sentry/nextjs').catch(() => null);
      Sentry?.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV ?? 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeSend(event: any) {
          if (event.request?.cookies) delete event.request.cookies;
          if (event.request?.headers?.cookie) delete event.request.headers.cookie;
          if (event.request?.headers?.authorization) delete event.request.headers.authorization;
          return event;
        },
      });
    }
  }
}
