'use client';

/**
 * Module 1 — Client-side Meta Pixel event layer.
 *
 * The base pixel snippet itself is injected by
 * `@/components/layout/DeferredRuntimeServices` (lazyOnload, consent-gated,
 * idle-deferred) so it never blocks Core Web Vitals. This module adds the
 * typed event API on top of `window.fbq` and mirrors every event to the
 * server-side Conversions API route (`/api/meta/conversions`) using the SAME
 * `event_id`, which is what guarantees 1:1 Pixel <-> CAPI deduplication.
 *
 * Env (paste in apps/public/.env.local and your hosting dashboard):
 *   NEXT_PUBLIC_META_PIXEL_ID=1234567890123456   # Events Manager -> Data sources -> Pixel ID
 *
 * Privacy: events are only dispatched when `window.fbq` exists, i.e. after the
 * visitor accepted analytics consent (the pixel is consent-gated). Never send
 * CAPI events for non-consenting visitors.
 */

export type MetaStandardEvent = 'PageView' | 'ViewContent' | 'AddToCart' | 'Lead' | 'Contact';

export interface MetaEventUserData {
  /** Raw email — SHA-256 hashing happens server-side in the CAPI route. */
  email?: string;
  /** Raw phone (any format) — normalized to E.164 digits and hashed server-side. */
  phone?: string;
}

export interface MetaCustomData {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Cryptographically strong client-side event ID. Meta only requires the ID to
 * be unique per (event_name, event) pair, so a UUID v4 with a readable prefix
 * is sufficient and keeps Events Manager payloads easy to grep.
 */
export function generateMetaEventId(prefix = 'tb'): string {
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'tb';

  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return `${safePrefix}_${crypto.randomUUID()}`;
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${safePrefix}_${hex}`;
    }
  }

  // Last-resort fallback for very old browsers (non-crypto, still unique enough).
  return `${safePrefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** `_fbp` / `_fbc` are set by the Meta pixel and fbclid landing pages. */
export function getMetaBrowserCookies(): { fbp?: string; fbc?: string } {
  return {
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
  };
}

interface DispatchOptions {
  params?: MetaCustomData;
  userData?: MetaEventUserData;
  /** Pass an existing ID when you need to correlate with an external system. */
  eventId?: string;
}

/**
 * Fire a standard event on the browser pixel AND mirror it to the Conversions
 * API route with an identical `event_id`. Returns the event ID used.
 */
export function trackMetaEvent(eventName: MetaStandardEvent, options: DispatchOptions = {}): string {
  if (typeof window === 'undefined') return '';

  const eventId = options.eventId ?? generateMetaEventId(eventName);
  // Capture into a const so TS narrows it inside the try block.
  const fbq = typeof window.fbq === 'function' ? window.fbq : undefined;

  // 1) Browser pixel (no-op until consent is accepted and fbevents.js loads).
  if (fbq) {
    try {
      fbq('track', eventName, options.params ?? {}, { eventID: eventId });
    } catch (error) {
      console.warn('Meta pixel dispatch failed', error);
    }
  }

  // 2) Server-side CAPI mirror. Only sent when the pixel is active so tracking
  //    stays consent-aligned. keepalive lets the request survive navigation.
  if (fbq) {
    try {
      const { fbp, fbc } = getMetaBrowserCookies();
      void fetch('/api/meta/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_source_url: window.location.href,
          user_data: {
            email: options.userData?.email,
            phone: options.userData?.phone,
            fbp,
            fbc,
          },
          custom_data: options.params,
        }),
      }).catch((error) => console.warn('Meta CAPI dispatch failed', error));
    } catch (error) {
      console.warn('Meta CAPI dispatch failed', error);
    }
  }

  return eventId;
}

interface MetaProductLike {
  id?: string | number | null;
  name?: string | null;
  title?: string | null;
  price?: number | null;
  category?: string | null;
}

function toContentParams(product: MetaProductLike): MetaCustomData {
  const id = product.id != null ? String(product.id) : undefined;
  return {
    content_ids: id ? [id] : undefined,
    content_type: 'product',
    content_name: product.title || product.name || undefined,
    content_category: product.category || undefined,
    value: typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : undefined,
    currency: 'INR',
  };
}

/** Standard ViewContent for a product detail page. */
export function trackMetaViewContent(product: MetaProductLike): string {
  return trackMetaEvent('ViewContent', { params: toContentParams(product) });
}

/** Standard AddToCart for cart actions. */
export function trackMetaAddToCart(product: MetaProductLike): string {
  return trackMetaEvent('AddToCart', { params: toContentParams(product) });
}

/** Standard Lead with optional PII (hashed server-side before dispatch). */
export function trackMetaLead(userData: MetaEventUserData, contentName?: string): string {
  return trackMetaEvent('Lead', {
    params: contentName ? { content_name: contentName } : undefined,
    userData,
  });
}

/** Standard Contact event (e.g. WhatsApp click-to-chat). */
export function trackMetaContact(contentName?: string): string {
  return trackMetaEvent('Contact', {
    params: contentName ? { content_name: contentName } : undefined,
  });
}
