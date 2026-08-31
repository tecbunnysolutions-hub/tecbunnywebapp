import { useEffect, useCallback, useRef } from 'react';

interface FunnelEventOptions {
  eventType: string;
  eventData?: Record<string, any>;
  email?: string;
  source?: string;
}

export function useFunnelEventTracking() {
  const sessionIdRef = useRef<string>();

  // Initialize session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Try to get from sessionStorage or generate new
    let sessionId = sessionStorage.getItem('funnel_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('funnel_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;
  }, []);

  const trackEvent = useCallback(async (options: FunnelEventOptions) => {
    if (!sessionIdRef.current) return;

    try {
      const response = await fetch('/api/funnel-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: options.eventType,
          eventData: options.eventData,
          email: options.email,
          source: options.source,
          sessionId: sessionIdRef.current,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      });

      if (!response.ok) {
        console.warn('Failed to track event:', options.eventType);
      }
    } catch (error) {
      console.warn('Error tracking event:', error);
    }
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return { trackEvent, getSessionId };
}

/**
 * Common funnel events:
 * 
 * assessment_started - User begins assessment form
 * assessment_step_completed - User completes a form step (step: 1|2|3)
 * assessment_abandoned - User leaves form incomplete (step: 1|2|3)
 * assessment_submitted - User completes and submits assessment (leadScore: number)
 * 
 * engagement_events:
 * whatsapp_clicked - User clicks WhatsApp CTA
 * phone_clicked - User clicks phone call CTA
 * resource_downloaded - User downloads guide/checklist/case-study
 * 
 * lead_qualification:
 * quote_requested - User requests quotation
 * site_survey_requested - User requests site survey
 * calendar_booked - User books appointment
 * 
 * page_views:
 * service_page_viewed - User views service detail page (service: string)
 * industry_page_viewed - User views industry-specific page (industry: string)
 * resource_page_viewed - User views knowledge base/guide (resource_type: string)
 */
