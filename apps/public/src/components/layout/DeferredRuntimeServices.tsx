'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';

import { useDeferredActivation } from '../../hooks/use-deferred-activation';
import { CookieConsentBanner, CONSENT_STORAGE_KEY, safeReadStoredConsent } from './CookieConsentBanner';

const Toaster = dynamic(
  () => import('@tecbunny/ui').then((module) => module.Toaster),
  { ssr: false }
);

type AnalyticsConsent = 'accepted' | 'rejected' | 'unknown';

function scheduleWhenIdle(callback: () => void, timeout = 2400) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const timeoutId = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(timeoutId);
}

type DeferredRuntimeServicesProps = {
  gaId?: string;
  metaPixelId?: string;
  nonce?: string;
};

type RuntimeServicesBoundaryState = {
  hasError: boolean;
};

class RuntimeServicesBoundary extends React.Component<React.PropsWithChildren, RuntimeServicesBoundaryState> {
  state: RuntimeServicesBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Deferred runtime services failed', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

class AnalyticsBoundary extends React.Component<React.PropsWithChildren, RuntimeServicesBoundaryState> {
  state: RuntimeServicesBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Analytics script failed to load', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export function DeferredRuntimeServices({ gaId, metaPixelId, nonce }: DeferredRuntimeServicesProps) {
  const isActivated = useDeferredActivation({ timeout: 8000 });
  const [shouldRender, setShouldRender] = React.useState(false);
  const [analyticsConsent, setAnalyticsConsent] = React.useState<AnalyticsConsent>('unknown');

  React.useEffect(() => {
    if (!isActivated) {
      return undefined;
    }

    return scheduleWhenIdle(() => setShouldRender(true));
  }, [isActivated]);

  React.useEffect(() => {
    const storedConsent = safeReadStoredConsent();
    if (storedConsent !== 'unknown') {
      setAnalyticsConsent(storedConsent);
    }
  }, []);

  // Update GA consent when user makes a choice. Updates are pushed through a
  // local dataLayer stub so they are queued even before gtag.js loads — the
  // 190KB library is only fetched after the user accepts, and it replays the
  // queued consent state on arrival.
  React.useEffect(() => {
    if (typeof window === 'undefined' || analyticsConsent === 'unknown') return;

    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer ?? [];
    if (typeof w.gtag !== 'function') {
      w.gtag = (...args: unknown[]) => {
        w.dataLayer?.push(args);
      };
    }

    if (analyticsConsent === 'accepted') {
      w.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else if (analyticsConsent === 'rejected') {
      w.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }, [analyticsConsent]);

  return (
    <RuntimeServicesBoundary>
      {/* Google Consent Mode v2 — must load before gtag.js so Google detects the tag */}
      {gaId ? (
        <AnalyticsBoundary>
          <Script id="ga-consent-defaults" strategy="lazyOnload" nonce={nonce}>
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 2000
});
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: false });`}
          </Script>
          {/* gtag.js (~190KB) is only fetched after the visitor accepts
              analytics consent — consent defaults above are queued via the
              inline dataLayer stub and replayed when the library arrives. */}
          {analyticsConsent === 'accepted' ? (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
              nonce={nonce}
              onError={(e: Error) => { console.warn('GA failed to load', e); }}
            />
          ) : null}
        </AnalyticsBoundary>
      ) : null}
      <CookieConsentBanner onConsentChange={setAnalyticsConsent} />
      {shouldRender ? <Toaster /> : null}
      {shouldRender && metaPixelId && analyticsConsent === 'accepted' ? (
        <AnalyticsBoundary>
          <Script
            id="meta-pixel-init"
            strategy="lazyOnload"
            nonce={nonce}
            onError={(e: Error) => { console.warn('Meta Pixel failed to load', e); }}
          >
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
          <noscript>
            {/* The analytics fallback must remain a raw pixel for noscript clients. */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </AnalyticsBoundary>
      ) : null}
    </RuntimeServicesBoundary>
  );
}
