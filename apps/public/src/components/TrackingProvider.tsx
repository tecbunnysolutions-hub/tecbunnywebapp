'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@tecbunny/database';
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
  const supabase = React.useMemo(() => createClient(), []);

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
    
    // Fire and forget insert
    const insertTrack = async () => {
      const { error } = await supabase.from('sls_visitor_tracking').insert({
        session_id: sessionId,
        url_visited: window.location.href,
        metadata: { path: pathname, title: document.title },
      });
      if (error) console.error('Tracking Error', error);
    };
    insertTrack();

  }, [pathname, sessionId, supabase]);

  const trackEvent = React.useCallback(async (eventType: string, metadata?: Record<string, any>) => {
    if (!sessionId) return;

    const { error } = await supabase.from('sls_visitor_tracking').insert({
      session_id: sessionId,
      url_visited: window.location.href,
      metadata: { event_type: eventType, ...metadata },
    });
    if (error) console.error('Event Tracking Error', error);
  }, [sessionId, supabase]);

  return (
    <TrackingContext.Provider value={{ sessionId, trackEvent }}>
      {children}
    </TrackingContext.Provider>
  );
}
