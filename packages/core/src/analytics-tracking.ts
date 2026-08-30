/**
 * Normalized Analytics Event Tracking
 * Standardized event taxonomy and metadata for conversion tracking
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'hero_cta_clicked'
  | 'assessment_started'
  | 'assessment_step_completed'
  | 'assessment_submitted'
  | 'assessment_upload_completed'
  | 'whatsapp_clicked'
  | 'phone_clicked'
  | 'email_clicked'
  | 'quote_requested'
  | 'resource_downloaded'
  | 'calculator_started'
  | 'calculator_completed'
  | 'case_study_viewed'
  | 'contact_form_started'
  | 'contact_form_submitted'
  | 'landing_page_viewed'
  | 'comparison_page_viewed'
  | 'service_card_clicked'
  | 'industry_card_clicked';

export interface AnalyticsMetadata {
  // Core context
  page?: string;
  timestamp?: number;
  session_id?: string;
  user_id?: string;

  // Business context
  service?: string;
  industry?: string;
  location?: string;

  // Attribution
  source?: string; // google, whatsapp, direct, instagram, referral, etc.
  campaign?: string; // utm_campaign
  medium?: string; // utm_medium
  content?: string; // utm_content
  term?: string; // utm_term

  // UI context
  cta_location?: string; // hero, sidebar, footer, inline, etc.
  cta_text?: string; // The button/link text

  // Event-specific data
  [key: string]: any;
}

/**
 * Sanitize metadata to prevent PII leakage
 * Removes sensitive fields that should never be tracked
 */
function sanitizeMetadata(metadata: AnalyticsMetadata): AnalyticsMetadata {
  const sanitized = { ...metadata };

  // Remove PII fields
  delete sanitized['name'];
  delete sanitized['email'];
  delete sanitized['phone'];
  delete sanitized['company'];
  delete sanitized['company_name'];
  delete sanitized['address'];
  delete sanitized['password'];
  delete sanitized['credit_card'];
  delete sanitized['ssn'];

  return sanitized;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(url?: string): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
} {
  if (typeof window === 'undefined' || !url) {
    return {};
  }

  try {
    const params = new URL(url, window.location.origin).searchParams;
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Get source context from referrer or URL
 */
export function getSourceContext(
  utm_source?: string,
  referrer?: string
): string {
  if (utm_source) return utm_source;

  if (referrer) {
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('instagram')) return 'instagram';
    if (referrer.includes('whatsapp')) return 'whatsapp';
    if (referrer.includes('linkedin')) return 'linkedin';
    return 'referral';
  }

  return 'direct';
}

/**
 * Main event tracking function
 * Sends normalized events to your analytics backend
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata: AnalyticsMetadata = {}
): Promise<boolean> {
  try {
    // Skip tracking in development (optional)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === 'true') {
      console.debug('[Analytics]', eventType, metadata);
      return true;
    }

    // Sanitize to prevent PII leakage
    const sanitized = sanitizeMetadata(metadata);

    // Enrich with session/page context if available
    const enriched: AnalyticsMetadata = {
      timestamp: Date.now(),
      ...sanitized,
    };

    if (typeof window !== 'undefined') {
      enriched.page = window.location.pathname;
      enriched.session_id = getOrCreateSessionId();

      // Auto-detect source if not provided
      if (!enriched.source) {
        enriched.source = getSourceContext(
          metadata.source,
          document.referrer
        );
      }

      // Parse UTM if not already in metadata
      if (!enriched.campaign) {
        const utm = parseUtmParams();
        enriched.utm_source = enriched.utm_source || utm.utm_source;
        enriched.utm_medium = enriched.utm_medium || utm.utm_medium;
        enriched.utm_campaign = enriched.utm_campaign || utm.utm_campaign;
        enriched.utm_content = enriched.utm_content || utm.utm_content;
        enriched.utm_term = enriched.utm_term || utm.utm_term;
      }
    }

    // Send to your analytics backend
    // Option 1: Send to /api/analytics/track endpoint
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        metadata: enriched,
      }),
      keepalive: true, // Ensure delivery even if page unloads
    });

    return response.ok;
  } catch (err) {
    console.error('[Analytics Error]', err);
    return false;
  }
}

/**
 * Get or create session ID
 * Stores in sessionStorage so it persists across page reloads within a session
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const key = 'tecbunny_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Batch event tracking for multiple events
 */
export async function trackEventBatch(
  events: Array<{ event: AnalyticsEventType; metadata?: AnalyticsMetadata }>
): Promise<boolean> {
  try {
    const response = await fetch('/api/analytics/track-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });

    return response.ok;
  } catch (err) {
    console.error('[Analytics Batch Error]', err);
    return false;
  }
}

/**
 * Page view tracking (call once per page load)
 */
export function trackPageView(metadata?: AnalyticsMetadata): Promise<boolean> {
  return trackEvent('page_view', {
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    ...metadata,
  });
}

/**
 * CTA click tracking (generic helper)
 */
export function trackCtaClick(
  ctaType: string,
  location: string,
  metadata?: AnalyticsMetadata
): Promise<boolean> {
  return trackEvent('hero_cta_clicked', {
    cta_type: ctaType,
    cta_location: location,
    ...metadata,
  });
}

/**
 * Assessment flow tracking
 */
export const AssessmentTracking = {
  started: (service?: string, industry?: string) =>
    trackEvent('assessment_started', { service, industry }),

  stepCompleted: (step: number, service?: string) =>
    trackEvent('assessment_step_completed', { step, service }),

  submitted: (service?: string, industry?: string, hasDocument?: boolean) =>
    trackEvent('assessment_submitted', { service, industry, has_document: hasDocument }),

  uploadCompleted: (fileName?: string, fileSize?: number) =>
    trackEvent('assessment_upload_completed', { file_name: fileName, file_size: fileSize }),
};

/**
 * Contact tracking
 */
export const ContactTracking = {
  whatsappClicked: (source?: string) =>
    trackEvent('whatsapp_clicked', { source }),

  phoneClicked: (source?: string) =>
    trackEvent('phone_clicked', { source }),

  emailClicked: (source?: string) =>
    trackEvent('email_clicked', { source }),

  formStarted: (formType?: string) =>
    trackEvent('contact_form_started', { form_type: formType }),

  formSubmitted: (formType?: string, industry?: string) =>
    trackEvent('contact_form_submitted', { form_type: formType, industry }),
};

/**
 * Content tracking
 */
export const ContentTracking = {
  resourceDownloaded: (resourceName: string, resourceType?: string) =>
    trackEvent('resource_downloaded', { resource_name: resourceName, resource_type: resourceType }),

  caseStudyViewed: (caseStudyTitle?: string, industry?: string) =>
    trackEvent('case_study_viewed', { case_study_title: caseStudyTitle, industry }),

  comparisonViewed: (comparisonType?: string) =>
    trackEvent('comparison_page_viewed', { comparison_type: comparisonType }),

  landingPageViewed: (pageType?: string, industry?: string) =>
    trackEvent('landing_page_viewed', { page_type: pageType, industry }),
};

/**
 * Tool tracking
 */
export const ToolTracking = {
  calculatorStarted: (calculatorType: string) =>
    trackEvent('calculator_started', { calculator_type: calculatorType }),

  calculatorCompleted: (calculatorType: string, result?: string) =>
    trackEvent('calculator_completed', { calculator_type: calculatorType, result }),

  quoteRequested: (service?: string) =>
    trackEvent('quote_requested', { service }),
};
