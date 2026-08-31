/**
 * Lead Scoring Engine
 * Classifies assessment leads as HOT/WARM/COLD based on engagement signals
 */

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';

export interface LeadScoreBreakdown {
  urgency: number;
  projectSize: number;
  completeness: number;
  documentation: number;
  contactQuality: number;
  totalScore: number;
  priority: LeadPriority;
  signals: string[];
}

export interface AssessmentData {
  service: string;
  industry: string;
  scale: string;
  project_size?: string | null;
  timeline: string;
  city: string;
  business_type?: string | null;
  project_stage?: string | null;
  phone?: string | null;
  company_name?: string | null;
  email?: string | null;
  current_problem?: string | null;
  additional_notes?: string | null;
  document_url?: string | null;
  budget?: string | null;
}

/**
 * Score lead urgency based on timeline
 */
function scoreUrgency(timeline: string): { score: number; signal: string } {
  const timelineMap: Record<string, { score: number; signal: string }> = {
    'immediate': { score: 40, signal: 'Immediate requirement' },
    '1_month': { score: 25, signal: '1-month timeline' },
    '1_3_months': { score: 15, signal: '1-3 month timeline' },
    'exploring': { score: 5, signal: 'Exploring/budgeting stage' },
  };
  return timelineMap[timeline] || { score: 0, signal: 'No timeline specified' };
}

/**
 * Score project size/opportunity
 */
function scoreProjectSize(scale: string): { score: number; signal: string } {
  if (scale.includes('Large') || scale.includes('Enterprise') || scale.includes('Multi-Building')) {
    return { score: 30, signal: 'Large/enterprise scale project' };
  }
  if (scale.includes('Medium')) {
    return { score: 15, signal: 'Medium-scale project' };
  }
  if (scale.includes('Small')) {
    return { score: 8, signal: 'Small-scale project' };
  }
  return { score: 0, signal: 'Scale not specified' };
}

function scoreBusinessType(businessType: string): { score: number; signal: string } {
  if (!businessType) {
    return { score: 0, signal: 'Business type not specified' };
  }

  const normalized = businessType.toLowerCase();
  if (
    normalized.includes('hospitality') ||
    normalized.includes('resort') ||
    normalized.includes('real estate') ||
    normalized.includes('developer') ||
    normalized.includes('enterprise')
  ) {
    return { score: 10, signal: 'High-value property/business profile' };
  }

  if (
    normalized.includes('healthcare') ||
    normalized.includes('manufacturing') ||
    normalized.includes('retail') ||
    normalized.includes('corporate') ||
    normalized.includes('education')
  ) {
    return { score: 7, signal: 'Business profile supports a structured rollout' };
  }

  return { score: 4, signal: 'Business profile qualifies for standard assessment' };
}

function scoreProjectStage(projectStage: string): { score: number; signal: string } {
  if (!projectStage) {
    return { score: 0, signal: 'Project stage not specified' };
  }

  const normalized = projectStage.toLowerCase();
  if (normalized.includes('urgent') || normalized.includes('immediate')) {
    return { score: 18, signal: 'Urgent implementation requirement' };
  }
  if (normalized.includes('ready to request') || normalized.includes('proposal')) {
    return { score: 12, signal: 'Decision-ready project stage' };
  }
  if (normalized.includes('planning') || normalized.includes('quarter')) {
    return { score: 8, signal: 'Planned project with clear next steps' };
  }
  return { score: 4, signal: 'Exploration stage' };
}

function scoreApproximateProjectSize(projectSize: string): { score: number; signal: string } {
  if (!projectSize) {
    return { score: 0, signal: 'Approximate project size not specified' };
  }

  const normalized = projectSize.toLowerCase();
  if (normalized.includes('100+') || normalized.includes('enterprise') || normalized.includes('multi-site')) {
    return { score: 18, signal: 'Large multi-site or enterprise footprint' };
  }
  if (normalized.includes('25-100') || normalized.includes('moderate') || normalized.includes('multi-floor')) {
    return { score: 12, signal: 'Medium footprint project' };
  }
  if (normalized.includes('10-25') || normalized.includes('small rollout') || normalized.includes('single-site')) {
    return { score: 8, signal: 'Smaller rollout project' };
  }
  return { score: 5, signal: 'Project size is being scoped' };
}

/**
 * Score form completeness and documentation
 */
function scoreCompleteness(data: AssessmentData): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  if (data.phone) {
    score += 10;
    signals.push('Phone number provided');
  }

  if (data.current_problem && data.current_problem.trim().length > 20) {
    score += 8;
    signals.push('Detailed problem statement');
  }

  if (data.additional_notes && data.additional_notes.trim().length > 15) {
    score += 5;
    signals.push('Additional requirements provided');
  }

  if (data.document_url) {
    score += 25;
    signals.push('Blueprint/documentation uploaded');
  }

  if (data.company_name && data.email && data.phone) {
    score += 10;
    signals.push('Complete contact details');
  }

  if (data.budget && !data.budget.includes('Flexible')) {
    score += 5;
    signals.push('Budget range specified');
  }

  return { score, signals };
}

/**
 * Score industry/service combination value
 */
function scoreIndustryValue(industry: string, service: string): { score: number; signal: string } {
  // High-value combinations
  const highValue = [
    ['Hospitality', 'smart-infrastructure'],
    ['Hospitality', 'physical-security'],
    ['Hospitality', 'smart-access-control'],
    ['Real Estate', 'network-infrastructure'],
    ['Real Estate', 'smart-infrastructure'],
    ['Healthcare', 'physical-security'],
    ['Manufacturing', 'network-infrastructure'],
  ];

  for (const [ind, svc] of highValue) {
    if (industry.includes(ind) && service.includes(svc)) {
      return { score: 15, signal: `High-value combination: ${ind} + ${svc}` };
    }
  }

  return { score: 5, signal: 'Standard industry/service combination' };
}

/**
 * Main lead scoring function
 */
export function scoreLeadPriority(data: AssessmentData): LeadScoreBreakdown {
  const signals: string[] = [];

  // Score each dimension
  const urgency = scoreUrgency(data.timeline);
  const projectSize = scoreProjectSize(data.scale);
  const approximateProjectSize = scoreApproximateProjectSize(data.project_size || '');
  const businessType = scoreBusinessType(data.business_type || '');
  const projectStage = scoreProjectStage(data.project_stage || '');
  const { score: completeness, signals: completenessSignals } = scoreCompleteness(data);
  const industryValue = scoreIndustryValue(data.industry, data.service);

  signals.push(urgency.signal);
  signals.push(projectSize.signal);
  signals.push(approximateProjectSize.signal);
  signals.push(businessType.signal);
  signals.push(projectStage.signal);
  signals.push(...completenessSignals);
  signals.push(industryValue.signal);

  const totalScore = Math.min(100, urgency.score + projectSize.score + approximateProjectSize.score + businessType.score + projectStage.score + completeness + industryValue.score);

  // Classify priority
  let priority: LeadPriority;
  if (totalScore >= 85) {
    priority = 'HOT';
  } else if (totalScore >= 50) {
    priority = 'WARM';
  } else {
    priority = 'COLD';
  }

  return {
    urgency: urgency.score,
    projectSize: projectSize.score,
    completeness,
    documentation: data.document_url ? 25 : 0,
    contactQuality: data.phone && data.email ? 10 : 0,
    totalScore,
    priority,
    signals: [...new Set(signals)], // Deduplicate
  };
}

/**
 * Format lead score for internal dashboard display
 */
export function formatLeadScore(score: LeadScoreBreakdown): string {
  const emoji = score.priority === 'HOT' ? '🔥' : score.priority === 'WARM' ? '🟠' : '❄️';
  return `${emoji} ${score.priority} — ${score.totalScore}/100 — ${score.signals.slice(0, 3).join(' • ')}`;
}

/**
 * Get human-readable lead priority description
 */
export function describeLead(score: LeadScoreBreakdown): string {
  if (score.priority === 'HOT') {
    return 'Immediate action required. High-value, urgent project with complete information.';
  } else if (score.priority === 'WARM') {
    return 'Medium priority. Good project fit with clear timeline and project scale.';
  } else {
    return 'Research stage. Likely exploratory; schedule follow-up.';
  }
}
