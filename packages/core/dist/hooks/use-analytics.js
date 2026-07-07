'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
const PAGE_VIEW_STORAGE_KEY = 'analytics_last_page_view_path';
function createSessionId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function scheduleWhenIdle(callback, timeout = 1200) {
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
export const useAnalytics = ({ autoTrackPageView = false } = {}) => {
    const pathname = usePathname();
    const sessionId = useRef('');
    const sendToGtag = useCallback((eventType, data) => {
        if (typeof window === 'undefined') {
            return;
        }
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventType, {
                page_location: window.location.href,
                page_path: pathname,
                page_title: typeof document !== 'undefined' ? document.title : undefined,
                ...data,
            });
        }
        if (eventType === 'page_view' && typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
    }, [pathname]);
    useEffect(() => {
        // Initialize session ID
        let storedSession = sessionStorage.getItem('analytics_session_id');
        if (!storedSession) {
            storedSession = createSessionId();
            sessionStorage.setItem('analytics_session_id', storedSession);
        }
        sessionId.current = storedSession;
    }, []);
    const trackEvent = useCallback(async (eventType, data) => {
        sendToGtag(eventType, data);
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType,
                    pageUrl: window.location.href,
                    sessionId: sessionId.current,
                    ...data,
                })
            });
        }
        catch (error) {
            console.error('Failed to track event', error);
        }
    }, [sendToGtag]);
    useEffect(() => {
        if (!autoTrackPageView || !pathname || typeof window === 'undefined') {
            return undefined;
        }
        const previousPath = sessionStorage.getItem(PAGE_VIEW_STORAGE_KEY);
        if (previousPath === pathname) {
            return undefined;
        }
        sessionStorage.setItem(PAGE_VIEW_STORAGE_KEY, pathname);
        return scheduleWhenIdle(() => {
            void trackEvent('page_view');
        });
    }, [autoTrackPageView, pathname, trackEvent]);
    return { trackEvent };
};
