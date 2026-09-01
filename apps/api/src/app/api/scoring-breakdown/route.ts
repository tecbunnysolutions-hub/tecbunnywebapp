import { createServiceClient } from '@tecbunny/core/supabase/service-client';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ScoringBreakdown {
  totalScore: number;
  priority: 'HOT' | 'WARM' | 'COLD';
  signals: Array<{
    name: string;
    category: 'urgency' | 'scale' | 'profile' | 'readiness' | 'completeness';
    score: number;
    maxScore: number;
    description: string;
    indicator: 'strong' | 'good' | 'weak';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
  }>;
  nextSteps: Array<{
    step: number;
    title: string;
    timeframe: string;
    description: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const email = searchParams.get('email');

    if (!leadId && !email) {
      return NextResponse.json(
        { success: false, error: 'leadId or email is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch lead record
    let lead;
    if (leadId) {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', leadId)
        .single();
      lead = data;
    } else {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
      lead = data?.[0];
    }

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Parse message to extract scoring data
    const message = lead.message || '';
    const getFieldValue = (field: string): string => {
      const regex = new RegExp(`${field}:\\s*(.+?)(?:\\n|$)`, 'i');
      const match = message.match(regex);
      return match ? match[1].trim() : '';
    };

    const timeline = getFieldValue('Implementation Timeline');
    const projectSize = getFieldValue('Approximate Project Size');
    const businessType = getFieldValue('Business Type') || 'Unknown';
    const projectStage = getFieldValue('Project Stage');
    const budget = getFieldValue('Estimated Budget');
    const problem = getFieldValue('Current Problem');
    const hasProblem = problem && problem.toLowerCase() !== 'not specified' && problem.length > 20;
    const hasPhone = Boolean(lead.phone && lead.phone.length >= 10);
    const hasNotes = Boolean(lead.message && lead.message.length > 100);
    const hasCompany = Boolean(lead.company_name && lead.company_name.trim().length > 0);
    const hasBudget = budget && !budget.toLowerCase().includes('flexible');

    // Calculate individual scoring signals
    const signals = [];

    // 1. URGENCY SIGNAL (0-40)
    let urgencyScore = 0;
    let urgencyDesc = '';
    if (timeline.includes('Within 2 weeks') || timeline.includes('Urgent')) {
      urgencyScore = 40;
      urgencyDesc = 'Immediate need - wants action within 2 weeks';
    } else if (timeline.includes('Within 30 days')) {
      urgencyScore = 25;
      urgencyDesc = 'Mid-term need - plans implementation within month';
    } else if (timeline.includes('Within 3 months')) {
      urgencyScore = 15;
      urgencyDesc = 'Planned need - timeline is flexible';
    } else {
      urgencyScore = 5;
      urgencyDesc = 'Long-term exploration - no immediate timeline';
    }

    signals.push({
      name: 'Implementation Urgency',
      category: 'urgency' as const,
      score: urgencyScore,
      maxScore: 40,
      description: urgencyDesc,
      indicator: urgencyScore >= 30 ? 'strong' : urgencyScore >= 15 ? 'good' : 'weak',
    });

    // 2. PROJECT SCALE (0-30)
    let scaleScore = 0;
    let scaleDesc = '';
    if (projectSize.includes('100+') || projectSize.includes('enterprise')) {
      scaleScore = 30;
      scaleDesc = 'Large enterprise scale - significant project value';
    } else if (projectSize.includes('25-100') || projectSize.includes('multi-floor')) {
      scaleScore = 20;
      scaleDesc = 'Medium scale - substantial implementation';
    } else if (projectSize.includes('10-25')) {
      scaleScore = 12;
      scaleDesc = 'Moderate scale - standard deployment';
    } else {
      scaleScore = 8;
      scaleDesc = 'Small scale - limited device footprint';
    }

    signals.push({
      name: 'Project Scale & Value',
      category: 'scale' as const,
      score: scaleScore,
      maxScore: 30,
      description: scaleDesc,
      indicator: scaleScore >= 20 ? 'strong' : scaleScore >= 12 ? 'good' : 'weak',
    });

    // 3. BUSINESS TYPE PROFILE (0-10)
    let profileScore = 0;
    let profileDesc = '';
    const highValueTypes = ['Hospitality', 'Real Estate', 'Healthcare'];
    if (highValueTypes.some(type => businessType.includes(type))) {
      profileScore = 10;
      profileDesc = 'High-value industry profile - strong revenue potential';
    } else {
      profileScore = 5;
      profileDesc = 'Standard industry profile';
    }

    signals.push({
      name: 'Business Profile Value',
      category: 'profile' as const,
      score: profileScore,
      maxScore: 10,
      description: profileDesc,
      indicator: profileScore === 10 ? 'strong' : 'good',
    });

    // 4. PROJECT READINESS (0-18)
    let readinessScore = 0;
    let readinessDesc = '';
    if (projectStage.includes('Urgent') || projectStage.includes('Immediate')) {
      readinessScore = 18;
      readinessDesc = 'Urgent action required - ready to engage NOW';
    } else if (projectStage.includes('New installation')) {
      readinessScore = 14;
      readinessDesc = 'Actively planning - ready for proposal within 1 week';
    } else if (projectStage.includes('Planning')) {
      readinessScore = 8;
      readinessDesc = 'Early planning stage - evaluating options';
    } else {
      readinessScore = 4;
      readinessDesc = 'Long-term consideration - early research phase';
    }

    signals.push({
      name: 'Project Readiness & Timeline',
      category: 'readiness' as const,
      score: readinessScore,
      maxScore: 18,
      description: readinessDesc,
      indicator: readinessScore >= 14 ? 'strong' : readinessScore >= 8 ? 'good' : 'weak',
    });

    // 5. ASSESSMENT COMPLETENESS (0-68)
    let completenessScore = 0;
    let completenessDetails = [];

    if (hasPhone) {
      completenessScore += 14;
      completenessDetails.push('Phone provided');
    }
    if (hasProblem) {
      completenessScore += 14;
      completenessDetails.push('Detailed problem description');
    }
    if (hasNotes) {
      completenessScore += 14;
      completenessDetails.push('Additional project notes included');
    }
    if (hasCompany) {
      completenessScore += 10;
      completenessDetails.push('Company name on file');
    }
    if (hasBudget) {
      completenessScore += 10;
      completenessDetails.push('Budget range specified');
    }
    if (lead.message && lead.message.length > 150) {
      completenessScore += 6;
      completenessDetails.push('Comprehensive submission');
    }

    signals.push({
      name: 'Assessment Completeness',
      category: 'completeness' as const,
      score: completenessScore,
      maxScore: 68,
      description: `${completenessDetails.join(', ')} - lead provided ${completenessDetails.length} quality indicators`,
      indicator: completenessScore >= 40 ? 'strong' : completenessScore >= 25 ? 'good' : 'weak',
    });

    // Total score
    const totalScore = Math.min(
      urgencyScore + scaleScore + profileScore + readinessScore + completenessScore,
      100
    );

    // Determine priority
    let priority: 'HOT' | 'WARM' | 'COLD' = 'COLD';
    if (totalScore >= 85) priority = 'HOT';
    else if (totalScore >= 50) priority = 'WARM';

    // Generate recommendations
    const recommendations = [];

    if (urgencyScore < 20) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Nurture with follow-up in 2-3 weeks',
        reason: 'Lead is evaluating, not actively buying yet',
      });
    }

    if (scaleScore < 15) {
      recommendations.push({
        priority: 'medium' as const,
        action: 'Ask about expansion plans in conversation',
        reason: 'Small scope may indicate incomplete requirements capture',
      });
    }

    if (completenessScore < 35) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Request detailed site survey meeting',
        reason: 'Missing critical project details to qualify properly',
      });
    }

    if (hasBudget) {
      recommendations.push({
        priority: 'medium' as const,
        action: 'Have BOQ ready before call',
        reason: 'Lead has budget expectations - prepare detailed proposal',
      });
    }

    if (priority === 'HOT') {
      recommendations.push({
        priority: 'high' as const,
        action: 'Call or WhatsApp within 2 hours',
        reason: 'High-intent lead - speed of response directly impacts conversion',
      });
    }

    // Next steps
    const nextSteps = [];

    if (priority === 'HOT') {
      nextSteps.push(
        {
          step: 1,
          title: 'Immediate Contact',
          timeframe: 'Within 2 hours',
          description: 'Call or WhatsApp to confirm requirements and timeline',
        },
        {
          step: 2,
          title: 'Schedule Site Survey',
          timeframe: 'Within 24 hours',
          description: 'Coordinate on-site inspection to measure and validate',
        },
        {
          step: 3,
          title: 'Generate BOQ',
          timeframe: 'Within 2-3 days',
          description: 'Prepare itemized Bill of Materials with Tier-1 options',
        }
      );
    } else if (priority === 'WARM') {
      nextSteps.push(
        {
          step: 1,
          title: 'Initial Outreach',
          timeframe: 'Within 24 hours',
          description: 'Email or WhatsApp with preliminary technical assessment',
        },
        {
          step: 2,
          title: 'Request Information',
          timeframe: 'Within 3 days',
          description: 'Ask for site layout, current infrastructure, pain points',
        },
        {
          step: 3,
          title: 'Nurture Sequence',
          timeframe: 'Ongoing',
          description: 'Send relevant case studies and technical guides',
        }
      );
    } else {
      nextSteps.push(
        {
          step: 1,
          title: 'Welcome Email',
          timeframe: 'Day 1',
          description: 'Thank them for inquiry, send relevant resources',
        },
        {
          step: 2,
          title: 'Nurture Sequence',
          timeframe: 'Weekly',
          description: 'Industry-specific guides, case studies, webinars',
        },
        {
          step: 3,
          title: 'Re-engagement',
          timeframe: '30+ days',
          description: 'Check-in to see if project has moved forward',
        }
      );
    }

    const breakdown: ScoringBreakdown = {
      totalScore,
      priority,
      signals,
      recommendations,
      nextSteps,
    };

    return NextResponse.json({
      success: true,
      breakdown,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        company: lead.company_name,
      },
    });
  } catch (error) {
    console.error('Error in scoring-breakdown route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
