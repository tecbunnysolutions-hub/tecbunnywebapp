import { createServiceClient } from '@tecbunny/core/supabase/service-client';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AbandonedAssessmentPayload {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  completedStep: number;
  service?: string;
  timeline?: string;
  businessType?: string;
  industry?: string;
  projectStage?: string;
  projectSize?: string;
  city?: string;
  budget?: string;
  currentProblem?: string;
  sourceContext?: string;
  userAgent?: string;
  referrer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AbandonedAssessmentPayload = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.completedStep || body.completedStep < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid completed step' },
        { status: 400 }
      );
    }

    // Prevent duplicate entries: check if similar abandoned assessment exists in last 5 minutes
    const supabase = createServiceClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentAbandoned, error: checkError } = await supabase
      .from('abandoned_assessments')
      .select('id')
      .eq('email', body.email)
      .gte('created_at', fiveMinutesAgo)
      .eq('status', 'abandoned')
      .limit(1);

    if (checkError) {
      console.error('Error checking for duplicate abandoned assessments:', checkError);
    }

    // If recent abandoned record exists, update it instead of creating new
    if (recentAbandoned && recentAbandoned.length > 0) {
      const { error: updateError } = await supabase
        .from('abandoned_assessments')
        .update({
          completed_step: body.completedStep,
          name: body.name,
          company: body.company,
          phone: body.phone,
          service: body.service,
          timeline: body.timeline,
          business_type: body.businessType,
          industry: body.industry,
          project_stage: body.projectStage,
          project_size: body.projectSize,
          city: body.city,
          budget: body.budget,
          current_problem: body.currentProblem,
          source_context: body.sourceContext,
          user_agent: body.userAgent,
          referrer: body.referrer,
          abandoned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', recentAbandoned[0].id);

      if (updateError) {
        console.error('Error updating abandoned assessment:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update abandoned assessment' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Abandoned assessment updated',
      });
    }

    // Create new abandoned assessment record
    const { error: insertError } = await supabase
      .from('abandoned_assessments')
      .insert([
        {
          email: body.email,
          name: body.name,
          company: body.company,
          phone: body.phone,
          completed_step: body.completedStep,
          service: body.service,
          timeline: body.timeline,
          business_type: body.businessType,
          industry: body.industry,
          project_stage: body.projectStage,
          project_size: body.projectSize,
          city: body.city,
          budget: body.budget,
          current_problem: body.currentProblem,
          source_context: body.sourceContext,
          user_agent: body.userAgent,
          referrer: body.referrer,
          abandoned_at: new Date().toISOString(),
          status: 'abandoned',
          recovery_attempts: 0,
        },
      ]);

    if (insertError) {
      console.error('Error recording abandoned assessment:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record abandoned assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Abandoned assessment recorded',
    });
  } catch (error) {
    console.error('Error in abandoned-assessments route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
