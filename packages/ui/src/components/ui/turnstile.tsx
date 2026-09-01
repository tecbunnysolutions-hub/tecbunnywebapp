'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: TurnstileRenderOptions
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      isExpired: (widgetId: string) => boolean;
    };
  }
}

export interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  tabindex?: number;
  'response-field'?: boolean;
  'response-field-name'?: string;
  size?: 'normal' | 'compact' | 'flexible';
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  appearance?: 'always' | 'execute' | 'interaction-only';
  execution?: 'render' | 'execute';
  callback?: (token: string) => void;
  'error-callback'?: (error: any) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

export interface TurnstileProps {
  sitekey: string;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  retry?: 'auto' | 'never';
  refreshExpired?: 'auto' | 'manual' | 'never';
  appearance?: 'always' | 'execute' | 'interaction-only';
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: any) => void;
  onTimeout?: () => void;
  className?: string;
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error('Cloudflare Turnstile script failed to load (blocked or unreachable)'));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export function Turnstile({
  sitekey,
  action,
  theme = 'dark',
  size = 'normal',
  retry = 'auto',
  refreshExpired = 'auto',
  appearance = 'always',
  onVerify,
  onExpire,
  onError,
  onTimeout,
  className,
}: TurnstileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'verified' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [renderCount, setRenderCount] = React.useState(0);

  // Keep latest callbacks in ref to prevent unnecessary re-renders
  const callbacksRef = React.useRef({ onVerify, onExpire, onError, onTimeout });
  React.useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError, onTimeout };
  });

  const handleRetry = React.useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    turnstileScriptPromise = null;
    const existing = document.getElementById('cf-turnstile-script');
    if (existing) existing.remove();
    setRenderCount(c => c + 1);
  }, []);

  React.useEffect(() => {
    let isCancelled = false;

    if (!sitekey || typeof window === 'undefined') return;

    setStatus('loading');
    setErrorMessage(null);

    loadTurnstileScript()
      .then(() => {
        if (isCancelled || !containerRef.current || !window.turnstile) return;

        // Clean up previous widget if any
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        // Clean container children
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey,
            action,
            theme,
            size,
            retry,
            'refresh-expired': refreshExpired,
            appearance,
            callback: (token: string) => {
              if (isCancelled) return;
              setStatus('verified');
              callbacksRef.current.onVerify?.(token);
            },
            'error-callback': (err: any) => {
              if (isCancelled) return;
              setStatus('error');
              setErrorMessage('Security verification error. Please click retry or disable ad-blockers.');
              callbacksRef.current.onError?.(err);
            },
            'expired-callback': () => {
              if (isCancelled) return;
              setStatus('ready');
              callbacksRef.current.onExpire?.();
            },
            'timeout-callback': () => {
              if (isCancelled) return;
              setStatus('error');
              setErrorMessage('Security verification timed out.');
              callbacksRef.current.onTimeout?.();
            },
          });

          widgetIdRef.current = id;
          setStatus('ready');
        } catch (renderError: any) {
          console.error('Turnstile render failed:', renderError);
          if (!isCancelled) {
            setStatus('error');
            setErrorMessage('Unable to initialize security check widget.');
            callbacksRef.current.onError?.(renderError);
          }
        }
      })
      .catch((scriptError: any) => {
        console.error('Turnstile script load failed:', scriptError);
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage('Security check blocked by browser or network.');
          callbacksRef.current.onError?.(scriptError);
        }
      });

    return () => {
      isCancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [sitekey, action, theme, size, retry, refreshExpired, appearance, renderCount]);

  return (
    <div className={cn('relative min-h-[65px] flex flex-col justify-center', className)}>
      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg border border-border/50 bg-muted/30 animate-pulse text-muted-foreground text-xs">
          <ShieldCheck className="h-4 w-4 text-primary animate-spin" />
          <span>Initializing Security Check...</span>
        </div>
      )}

      {/* Error Fallback with Retry */}
      {status === 'error' && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage || 'Security check failed'}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium rounded transition-colors text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Cloudflare Turnstile Container */}
      <div
        ref={containerRef}
        className={cn(
          'transition-opacity duration-200',
          status === 'loading' || status === 'error' ? 'hidden' : 'block'
        )}
      />
    </div>
  );
}
