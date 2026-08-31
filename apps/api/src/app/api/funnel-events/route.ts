import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@tecbunny/core/supabase/service-client';

export const runtime = 'nodejs';

interface FunnelEventPayload {
  eventType: string; // assessment_started, assessment_step_completed, assessment_abandoned, assessment_submitted, whatsapp_clicked, phone_clicked, etc.
  eventData?: Record<string, any>;
  sessionId?: string;
  userId?: string;
  email?: string;
  source?: string; // organic, google_ads, instagram, whatsapp_direct, industry_page, etc.
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FunnelEventPayload = await request.json();

    if (!body.eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Generate session ID if not provided
    const sessionId = body.sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Extract IP from headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Determine source attribution if not explicitly provided
    let attributedSource = body.source || 'direct';
    const referrer = body.referrer || request.headers.get('referer') || '';

    if (!body.source && referrer) {
      if (referrer.includes('google.com')) attributedSource = 'google_search';
      else if (referrer.includes('facebook.com')) attributedSource = 'facebook';
      else if (referrer.includes('instagram.com')) attributedSource = 'instagram';
      else if (referrer.includes('youtube.com')) attributedSource = 'youtube';
      else if (referrer.includes('linkedin.com')) attributedSource = 'linkedin';
      else if (referrer.includes('whatsapp.com')) attributedSource = 'whatsapp';
      else attributedSource = 'referral';
    }

    // Insert event record
    const { error: insertError } = await supabase
      .from('funnel_events')
      .insert([
        {
          session_id: sessionId,
          event_type: body.eventType,
          event_data: body.eventData || {},
          email: body.email || null,
          user_id: body.userId || null,
          source: attributedSource,
          referrer: referrer,
          user_agent: body.userAgent || request.headers.get('user-agent'),
          ip_address: ip,
          occurred_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('Error recording funnel event:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record event' },
        { status: 500 }
      );
    }

    // Auto-tag high-intent events
    if (body.eventType === 'assessment_submitted' && body.email) {
      const { data: contact, error: checkError } = await supabase
        .from('contact_messages')
        .select('id, email')
        .eq('email', body.email)
        .order('created_at', { ascending: false })
        .limit(1);

      // Update contact record with source if just submitted
      if (contact && contact.length > 0 && !checkError) {
        await supabase
          .from('contact_messages')
          .update({ lead_source: attributedSource })
          .eq('id', contact[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      source: attributedSource,
    });
  } catch (error) {
    console.error('Error in funnel-events route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
