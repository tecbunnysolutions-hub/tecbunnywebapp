'use client';

import * as React from 'react';
import Link from 'next/link';

type AnalyticsConsent = 'accepted' | 'rejected' | 'unknown';

const CONSENT_STORAGE_KEY = 'tecbunny_analytics_consent';

export function safeReadStoredConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  try {
    const storedValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedValue === 'accepted' || storedValue === 'rejected') {
      return storedValue;
    }
  } catch (e) {
    // Ignore localStorage blocked errors
  }

  try {
    const nameEQ = CONSENT_STORAGE_KEY + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const val = c.substring(nameEQ.length, c.length);
        if (val === 'accepted' || val === 'rejected') {
          return val as AnalyticsConsent;
        }
      }
    }
  } catch (e) {
    // Ignore cookie blocked errors
  }

  return 'unknown';
}

export function safeWriteStoredConsent(value: Exclude<AnalyticsConsent, 'unknown'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch (e) {
    // Ignore localStorage blocked errors
  }

  try {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    const expires = "; expires=" + date.toUTCString();
    document.cookie = CONSENT_STORAGE_KEY + "=" + value + expires + "; path=/; SameSite=Lax; Secure";
  } catch (e) {
    // Ignore cookie blocked errors
  }

  try {
    window.dispatchEvent(new CustomEvent('tecbunny:analytics-consent', { detail: value }));
  } catch (e) {
    // Ignore event dispatch errors
  }
}

type CookieConsentBannerProps = {
  onConsentChange?: (consent: Exclude<AnalyticsConsent, 'unknown'>) => void;
};

export function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [consent, setConsent] = React.useState<AnalyticsConsent>('unknown');
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const storedConsent = safeReadStoredConsent();
    setConsent(storedConsent);
    setHydrated(true);
  }, []);

  const updateConsent = React.useCallback(
    (nextConsent: Exclude<AnalyticsConsent, 'unknown'>) => {
      safeWriteStoredConsent(nextConsent);
      setConsent(nextConsent);
      onConsentChange?.(nextConsent);
    },
    [onConsentChange]
  );

  React.useEffect(() => {
    if (!hydrated || consent === 'unknown') {
      return;
    }

    onConsentChange?.(consent);
  }, [consent, hydrated, onConsentChange]);

  if (!hydrated || consent !== 'unknown') {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-border bg-card/95 px-4 py-3 text-card-foreground shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">Privacy Controls</p>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            TecBunny uses optional analytics and marketing cookies to measure site performance. Rejecting keeps the site fully usable.
          </p>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Review the details in{' '}
            <Link href="/info/policies/privacy" className="text-primary underline decoration-primary/60 underline-offset-4 transition hover:text-foreground">
              our privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => updateConsent('rejected')}
            className="min-h-11 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-foreground/30 hover:bg-muted/40 sm:px-5 sm:text-sm"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => updateConsent('accepted')}
            className="min-h-11 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 sm:px-5 sm:text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export { CONSENT_STORAGE_KEY };
