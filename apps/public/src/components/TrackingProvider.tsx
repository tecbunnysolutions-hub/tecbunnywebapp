'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export const TrackingContext = React.createContext<{
  sessionId: string | null;
  trackEvent: (eventType: string, metadata?: Record<string, any>) => void;
}>({
  sessionId: null,
  trackEvent: () => {},
});

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const pathname = usePathname();

  const sendEvent = React.useCallback(async (eventType: string, metadata: Record<string, unknown>, activeSessionId: string) => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        eventType,
        pageUrl: window.location.href,
        sessionId: activeSessionId,
        metadata,
      }),
    });
    if (!response.ok) throw new Error(`Analytics request failed (${response.status})`);
  }, []);

  // Initialize Session ID
  React.useEffect(() => {
    let sid = localStorage.getItem('sls_tracking_session');
    if (!sid) {
      sid = uuidv4() as string;
      localStorage.setItem('sls_tracking_session', sid);
    }
    setSessionId(sid);
  }, []);

  // Track Page Views
  React.useEffect(() => {
    if (!sessionId || !pathname) return;
    
    // Fire and forget through the central API; the browser never writes to the database.
    const insertTrack = async () => {
      try {
        await sendEvent('page_view', { path: pathname, title: document.title }, sessionId);
      } catch (error) {
        console.error('Tracking Error', error);
      }
    };
    insertTrack();

  }, [pathname, sendEvent, sessionId]);

  const trackEvent = React.useCallback(async (eventType: string, metadata?: Record<string, any>) => {
    if (!sessionId) return;

    try {
      await sendEvent(eventType, metadata ?? {}, sessionId);
    } catch (error) {
      console.error('Event Tracking Error', error);
    }
  }, [sendEvent, sessionId]);

  return (
    <TrackingContext.Provider value={{ sessionId, trackEvent }}>
      {children}
    </TrackingContext.Provider>
  );
}
